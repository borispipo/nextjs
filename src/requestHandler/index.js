// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {defaultStr,defaultObj,isNonNullString} from "$cutils";
import {getQueryParams} from "$cutils/uri";
import cors from "$cors";

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