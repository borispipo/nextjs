// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {defaultStr,extendObj,defaultObj,isNonNullString,isObj} from "$cutils";
import {getQueryParams} from "$cutils/uri";
import cors from "$cors";
import {SUCCESS,FORBIDEN,INTERNAL_SERVER_ERROR,UNAUTHORIZED} from "$capi/status";
import {withSession,getSession} from "$nauth";
import Auth from "$cauth";

export const getErrorStatus = (e)=>{
    if(isObj(e) && typeof e.status =='number'){
        return e.status;
    }
    return INTERNAL_SERVER_ERROR;
}
/*** handle l'erreur liée à l'exécution d'une requête */
export const handleError = (e,res)=>{
    const status = getErrorStatus(e);
    const r = {message:e && e.message,stackStrace:e && e.stackStrace,status};
    if(res && typeof res.json =="function"){
        return res.status(status).json(r);
    }
    return r;
}

export const tryCatch = (handler)=>{
    return async function(){
        const args = Array.prototype.slice.call(arguments,0);
        try {
            if(typeof handler =='function'){
                await handler.apply({},args);
            } 
        } catch (e){
            handleError(e,args[1]);
        }
    }
}
export const handleRequestError = handleError;
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
    const {isAllowed,perm} = options;
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
    const {withCors,onNoMatch,noFound,parseQuery,onNotFound} = options;
    return async function customRouteHandler(){
        const args = Array.prototype.slice.call(arguments,0);
        const req = args[0], res = args[1];
        const reqMethod = defaultStr(req.method).toUpperCase().trim();
        await cors(req,res);
        if(reqMethod =="OPTIONS"){
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
        ///on peut par défaut interdire de parser le query, en passant la variable parseQuery à false
        if(parseQuery !== false && isNonNullString(req.url)){
            try {
                const q = getQueryParams(req.url);
                req.query =  Object.size(q,true)? q : query;
            } catch(e){
                req.query = query;
            }
        }
        if(withCors !== false){
            await cors(req,res);
        }
        const isA = typeof isAllowed =='function' ;
        if(isNonNullString(perm) || isA){
            const session = await getSession(req);
            if(!isObj(session)){
                return res.status(UNAUTHORIZED).send({message:'Vous devez vous connecter pour accéder à la ressource demandée'});
            }
            let message = "Vous n'êtes pas autorisés d'acccéder à la ressource demandée";
            let hasError = false;
            if(isA){
                const r = await isAllowed({req,request:req,res,response:res,session,user:session,Auth});
                if(isNonNullString(r)){
                    message = r;
                }
                hasError = isNonNullString(r) || !r ? true : false;
            }
            if(!hasError && isNonNullString(perm) && !Auth.isAllowedFromString(perm,session)){
                hasError = true;
            }
            if(hasError){
                return res.status(FORBIDEN).send({message});
            }
        }
        return typeof handler =='function'? handler.apply({},args) : null;
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

const deleteRequest = (handler,options)=>{
    return handleRequest(handler,options,"delete");
}

export const METHODS = {
    GET : true,
    HEAD : true,
    POST : true,
    PUT : true,
    PATCH:true,
    DELETE : true,
}

export {deleteRequest as delete};

Object.map(METHODS,(i,method)=>{
    handleRequestWithMethod[method.toLowerCase()] = (handler,options)=>{
        return handleRequest(handler,options,method);
    }
});

export const getMethod = (method,defaultMethod)=>{
    return isNonNullString(method) && handleRequestWithMethod[method.trim().toLowerCase()] || defaultMethod;
}

/**** effectue une requête queryMany directement en base de données
 * @param {ModelInstance} Model, le model à utiliser pour effectuer la requête
 * @param {object} options les options supplémentaires pour effectuer la requête
 *      de la forme : 
 *       { mutate : {function} la fonction de rappel à appeler pour la mutation des données récupérées en bd
 *        getQuery {function} la fonction à utiliser pour récupérer la requête query à utiliser pour le queryMany|| querySingle
 *       }
 * @return la fonction de rappel, handler permettant d'exécuter la requête queryMany en s'appuyant sur le model passé en paramètre
 */
function _queryMany (Model,options,cb){
    options = prepareOptions(options);
    const {method,mutate,getQuery,...rest} = options;
    return getMethod(method,post)(withSession(async(req,res)=>{
        try {
            const query = extendObj(true,{},req.query,req.body,typeof getQuery == 'function' && await getQuery(args));
            const args = {req,request:req,res,response:res,query,session:req.session,req};
            const data = await Model[cb||'queryMany']({...rest,...defaultObj(query.fetchOptions),...args,...query});
            const result = isObj(data) && ('data' in data && 'total' in data && 'count' in data) ? data : {data};
            if(typeof mutate =='function'){
                await mutate(result,args);
            }
            return res.status(SUCCESS).json(result);
        } catch (e){
            console.log(e," found exception on api ",req.nextUrl?.basePath);
            return handleError(e,res);
        }
    }),options)
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
 *      beforeSave|beforeUpsert {function} la fonction de mutation a appéler avant l'enregistrement des données
 *      getData {function}, la fonction permettant de récupérer l'objet à enregistrer en bd
 *      doSave {function}, la fonction appelée par défaut pour l'enregistrement de la données, au cas où l'on veut faire l'insertion en base soit même
 * }
 * par défaut, utilise génère un handler écoutant la méthode put de requestHandler pour l'enregistrement des données
*/
export function save(Model,options){
    options = prepareOptions(options);
    const {method,mutate,getData,doSave,beforeValidate,validateOptions,beforeSave,beforeUpsert,...rest} = options;
    return getMethod(method,put)(withSession(async(req,res)=>{
        const data = typeof getData =='function' ? defaultObj(getData({req,request:req,res,response:res})) : defaultObj(req.body.data);
        const args = {req,request:req,res,response:res,user:req.session,userId:req.session.loginId,session:req.session,req,data};
        let generatePrimaryKey = options.generatePrimaryKey;
        generatePrimaryKey = generatePrimaryKey != undefined? !!generatePrimaryKey : true;
        try {
            if(typeof mutate =='function'){
                await mutate(args);
            } else if(typeof beforeValidate =='function'){
                await beforeValidate(args);
            }
            await Model.init();
            const {data:d} = await Model.validate({...rest,...args,...defaultObj(validateOptions),data,generatePrimaryKey,saveAction : true});
            const bef = typeof beforeSave =='function'? beforeSave : typeof beforeUpsert =='function'? beforeUpsert : null;
            if(bef){
                await bef({...args,data:d});
            }
            const updated = typeof doSave =='function'? await doSave(d) : await Model.save(d);
            return res.json({data:updated});
        } catch(e){
            console.log(e," saving data",data);
            return handleError(e,res);
        }
    }),options);
}


export const upsert = save;

/*** renvoie un requestHandler permettant de compter le nombre d'éléments d'une correspondant au model passé en paramètre
 * @param {ModelInstance} Model, le model à utiliser pour l'enregistrement des données
 * les données à enregistrer doivent être passées dans l'objet data du
 * @param {object} options les options supplémentaires à utiliser
 *      {
 *      method {string} la méthode que doit utiliser le handler de requête
 *      findOptions {object} les options à utilier pour effectuer la requête
 *      getFindOptions {function} la fonction permettant de récupéerr les options
 * }
 * par défaut, utilise génère un handler écoutant la méthode put de requestHandler pour l'enregistrement des données
*/
export function count(Model,options){
    options = prepareOptions(options);
    let {findOptions, getFindOptions,method} = options;
    return getMethod(method,get)(withSession(async(req,res)=>{
        findOptions = typeof getFindOptions =='function' ? defaultObj(getFindOptions({req,request:req,res,response:res,session:req.session,req})) : defaultObj(findOptions);
        try {
            await Model.init();
            const count = await Model.repository.count(findOptions);
            return res.json({count});
        } catch(e){
            console.log(e," count data ",findOptions);
            return handleError(e,res);
        }
    }),options);
}

/**** effectue une requête find|findOne en base de données */
function _find (Model,options,cb){
    options = prepareOptions(options);
    options.parseQuery = typeof options.parseQuery =='boolean'? options.parseQuery : false;
    const {method,mutate,getFindOptions,...rest} = options;
    return getMethod(method,get)(withSession(async(req,res)=>{
        const args = {req,request:req,res,response:res,session:req.session,req};
        const findOptions = typeof getFindOptions == 'function' ? await defaultObj(getFindOptions(args)) : defaultObj(req.query);
        args.findOptions = findOptions;
        try {
            const data = await Model[cb||'find']({...rest,...args,...findOptions,req});
            const result = {data};
            if(typeof mutate =='function'){
                await mutate(result,args);
            }
            return res.status(SUCCESS).json(result);
        } catch (e){
            console.log(e," found exception on api ",req.nextUrl?.basePath);
            return handleError(e,res);;
        }
    }),options)
}

/**** retourne un requestHandler permettant d'effectuer un queryMany en base de données */
export function find(Model,options){
    return _find(Model,options,'find');
}

/*** retourne le requestHandler permettant d'effectuer un queryOne en base de données*/
export function findOne (Model,options){
    return _find(Model,options,'findOne');
}


/**** effectue une requête remove, de suppression directement en base de données
 * @param {ModelInstance} Model, le model à utiliser pour effectuer la requête
 * @param {object} options les options supplémentaires pour effectuer la requête
 *      de la forme : 
 *       { beforeRemove : {function} la fonction de rappel à appeler avant suprression des données
 *         queryData {function} la fonction permettant de récupérer les donées en base de données avant suppression
 *         getFindOptions {function} la fonction à utiliser pour récupérer la requête query à utiliser pour le queryMany|| querySingle
 *       }
 * @return la fonction de rappel, handler permettant d'exécuter la requête queryMany en s'appuyant sur le model passé en paramètre
 */
function _remove (Model,options,cb){
    options = prepareOptions(options);
    const {method,getFindOptions,...rest} = options;
    options.parseQuery = typeof options.parseQuery =='boolean'? options.parseQuery : cb =='queryRemove'?true:false;
    return getMethod(method,deleteRequest)(withSession(async(req,res)=>{
        try {
            const args = {req,request:req,res,response:res,session:req.session,req};
            const findOptions = typeof getFindOptions == 'function' ? defaultObj(await getFindOptions(args)) : defaultObj(req.query);
            const data = await Model[cb||'queryRemove']({...rest,...args,...findOptions});
            return res.status(SUCCESS).json({data});
        } catch (e){
            console.log(e," found exception on remove api ",req.nextUrl?.basePath);
            return handleError(e,res);
        }
    }),options)
}
export function removeOne(Model,options){
    return _remove(Model,options,'removeOne');
}
export function removeMany(Model,options){
    return _remove(Model,options,'removeMany');
}
export function queryRemove(Model,options){
    return _remove(Model,options,'queryRemove');
}
export const prepareOptions = (options)=>{
    if(typeof options =='function'){
        return extendObj(true,{},options,{mutate:options});
    }
    return defaultObj(options);
}