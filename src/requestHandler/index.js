// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {defaultStr,defaultObj,isNonNullString} from "$cutils";
import {getQueryParams} from "$cutils/uri";
import cors from "$cors";
import {SUCCESS,INTERNAL_SERVER_ERROR} from "$capi/status";
import {withSession} from "$nauth";

/***** Execute une requête d'api uniquement pour la/les méthodes spécifiée(s)
 * @param {function} handler la fonction qui sera exécutée lorsque la/les méthode(s) sera/seront validée(s)
 * @param {string | {method:{string}, methods : [{string}], withCors : {boolean}}} les options supplémentaires
 *  si options est une chaine de caractère, alors celle si est considérée comme la/les méthodes supportée(s) par la requête
 *  options est de la forme : {
 *      method est la/les méthode(s) valide(nt) pour la requête, lorsqu'elle est définie. si plusieurs méthodes sont définies,
 *      elle peuvent être définies dans une chaine de caractère séparées par des virgules où un tableau
 *      withCors : spécifie si le cors sera utilisé
 * }
*/
export default function handleRequestWithMethod(handler,options){
    if(typeof options =='string'){
        options = {method:options};
    }
    options = defaultObj(options);
    const  method = Array.isArray(options.method) ? options.method : typeof options.method =='string' && options.method.toUpperCase().split(",") || [];
    const methods = [];
    method.map((m,i)=>{
        if(typeof m =='string' && m){
            m = m.toUpperCase().trim();
            if(METHODS[m]){
                methods.push(m);
            }
        }
    })
    const {withCors,onNoMatch,noFound,onNotFound} = options;
    return async function customRouteHandler(req,res,a1,a2,a3,a4,a5){
        const reqMethod = defaultStr(req.method).toUpperCase().trim();
        if(reqMethod =="OPTIONS"){
            await cors(req,res);
            return handler(req,res);
        }
        let canCheck = methods.length;
        let hasFound = false;
        if(canCheck){
            for(let i in methods){
                if(methods[i] == reqMethod){
                    hasFound = true;
                    break;
                }
            }
        }
        if (!hasFound && canCheck) {
            const nF = typeof onNoMatch =='function'? onNoMatch : typeof onNotFound =='function'? onNotFound : noFound;
            console.log(req?.nextUrl?.pathname || req.url," not allowed for method <<",req.method,">>. supported methods are ",methods,req.nextUrl)
            if(typeof nF =='function' && nF({req,res,request:req,status:NOT_FOUND,response:res}) == false) return;
            return res.status(405).send({message:"Page Non trouvée!! impossible d'exécuter la requête pour la méthode [{0}]; url : {1}, la où les méthodes supportées pour la requête sont : {2}".sprintf(req.method,req.url,methods.join(","))});
        }
        const query = req.query;
        ///la méthode reqParser qui parse la requête url de nextjs par défaut ne prend pas en compte la recursivité, on n'est donc obligé d'utiliser une fonction qui prend en compte les query recursives
        try {
            if(isNonNullString(req.url)){
                req.query = getQueryParams(req.url) || query;
            }
        } catch(e){
            req.query = query;
        }
        if(withCors !== false){
            await cors(req,res);
        }
        return typeof handler =='function'? handler(req,res,a1,a2,a3,a4,a5) : null;
    }
}   

const handleRequest = (handler,options,method)=>{
    options = defaultObj(options);
    options.method = method;
    return handleRequestWithMethod(handler,options);
}
export const get = (handler,options)=>{
    return handleRequest(handler,options,"get");
}
export const head = (handler,options)=>{
    return handleRequest(handler,options,"head");
}
export const post = (handler,options)=>{
    return handleRequest(handler,options,"post");
}
export const put = (handler,options)=>{
    return handleRequest(handler,options,"put");
}
export const patch = (handler,options)=>{
    return handleRequest(handler,options,"patch");
}

export const deletete = (handler,options)=>{
    return handleRequest(handler,options,"deletete");
}

export const METHODS = {
    GET : true,
    HEAD : true,
    POST : true,
    PUT : true,
    PATCH:true,
    DELETE : true,
}

Object.map(METHODS,(i,method)=>{
    handleRequestWithMethod[method.toLowerCase()] = (handler,options)=>{
        return handleRequest(handler,options,method);
    }
});

export const getMethod = (method)=>{
    return isNonNullstring(method) && handleRequestWithMethod[method.trim().toLowerCase()] || null;
}

/**** effectue une requête queryMany directement en base de données
 * @param {ModelInstance} Model, le model à utiliser pour effectuer la requête
 * @param {object} options les options supplémentaires pour effectuer la requête
 *      de la forme : 
 *       { mutate : {function} la fonction de rappel à appeler pour la mutation des données récupérées en bd
 *         mutateQuery {function} une fonction permettant de muter l'objet req.query avavant d'exécuer la requête en base de données
 *         getQuery {function} la fonction à utiliser pour récupérer la requête query à utiliser pour le queryMany|| querySingle
 *       }
 * @return la fonction de rappel, handler permettant d'exécuter la requête queryMany en s'appuyant sur le model passé en paramètre
 */
function _queryMany (Model,options,cb){
    if(typeof options =='function'){
        options = {mutate:options};
    }
    options = defaultObj(options);
    return getMethod(method,get)(withSession(async(req,res)=>{
        const {mutate,mutateQuery,getQuery} = options;
        const query = typeof getQuery == 'function' ? defaultObj(getQuery({req,request:req,res,response:res})) : defaultObj(req.query);
        if(typeof mutateQuery =='function'){
            mutateQuery(query);
        }
        try {
            const data = await Model[cb||'queryMany'](query);
            if(typeof mutate =='function'){
                await mutate(data);
            }
            return res.status(SUCCESS).json({data});
        } catch (e){
            console.log(e," found exception on api ",req.nextUrl?.basePath);
            return res.status(INTERNAL_SERVER_ERROR).json({message:e.message,error:e});
        }
    }))
}

/**** retourne un requestHandler permettant d'effectuer un queryMany en base de données */
export function queryMany(Model,options){
    return _queryMany(Model,options,'queryMany');
}

/*** retourne le requestHandler permettant d'effectuer un queryOne en base de données*/
export function queryOne (Model,options){
    return _queryMany(Model,options,'queryOne');
}

/*** renvoie un requestHandler permettant d'enregistrer en base de données les données issues des options de requête req.body
 * @param {ModelInstance} Model, le model à utiliser pour l'enregistrement des données
 * les données à enregistrer doivent être passées dans l'objet data du
 * @param {object} options les options supplémentaires à utiliser
 *      {
 *      method {string} la méthode que doit utiliser le handler de requête
 *      validateOptions {object} les options supplémentaires à passer à la fonction validate du model
 *      mutate | beforeValidate {function} la fonction supplémentaire à utiliser pour muter les données avant validation
 *      beforeSave {function} la fonction de mutation a appéler avant l'enregistrement des données
 *      getData {function}, la fonction permettant de récupérer l'objet à enregistrer en bd
 * }
 * par défaut, utilise génère un handler écoutant la méthode put de requestHandler pour l'enregistrement des données
*/
export function save(Model,options){
    if(typeof options =='function'){
        options = {mutate:options};
    }
    options = defaultObj(options);
    const {method,mutate,getData,beforeValidate,validateOptions,beforeSave} = options;
    const cb = isNonNullstring(method) && typeof requestHandler[method.trim().toLowerCase()] =='function'&& requestHandler[method.trim().toLowerCase()] || put;
    return cb(async(req,res)=>{
        const data = typeof getData =='function' ? defaultObj(getData({req,request:req,res,response:res})) : defaultObj(req.body.data);
        try {
            if(typeof mutate =='function'){
                await mutate(data);
            } else if(typeof beforeValidate =='function'){
                await beforeValidate(data);
            }
            await Model.init();
            const d = await Model.validate({...defaultObj(validateOptions),data});
            if(typeof beforeSave =='function'){
                await beforeSave(d);
            }
            const updated = await Model.repository.save(d);
            return res.json({data:updated});
        } catch(e){
            return res.status(INTERNAL_SERVER_ERROR).json({error:e,message:e.message})
        }
    });
}