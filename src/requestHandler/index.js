// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {defaultStr,defaultObj} from "$utils";
import cors from "$cors";

/***** Execute une requête d'api avec la méthode spécifiée
 * @param {function} handler la fonction qui sera utilisée lorsque la méthode sera validée
 * @param {{method:{string}, methods : [{string}], withCors : {boolean}}} les options supplémentaires
 *  options est de la forme : {
 *      method est la méthode valide pour la requête, lorsqu'elle est définie
 *      methods : sont les méthodes valides pour la requêtes lorsqu'ils sont spécifiés
 *      withCors : spécifie si le cors sera utilisé
 * }
*/
export default function handleRequestWithMethod(handler,options){
    options = defaultObj(options);
    let method = typeof options.method =='string' && options.method.toLowerCase() || undefined;
    if(typeof method !=='string' || !METHODS[method2.toUpperCase()]){
        method = undefined;
    }
    const methods = Array.isArray(options.methods)? options.methods : [];
    const {withCors,onNoMatch,noFound,onNotFound} = options;
    return async function customRouteHandler(req,res){
        const reqMethod = defaultStr(req?.method).toLowerCase();
        let canCheck = method ? true : false;
        let hasFound = false;
        if(!canCheck && methods.length){
            canCheck = true;
            for(let i in methods){
                const m = methods[i];
                if(m && typeof m =='string' && m.toLowerCase() == reqMethod){
                    hasFound = true;
                    break;
                }
            }
        }
        if(!hasFound && method){
            hasFound = method == reqMethod ? true : false;
        }
        if (!hasFound && canCheck) {
            if(!methods.length){
                methods.push(method);
            }
            const nF = typeof onNoMatch =='function'? onNoMatch : typeof onNotFound =='function'? onNotFound : noFound;
            console.log(req?.nextUrl?.pathname || req.url," not allowed for supported methods ",methods,req.nextUrl)
            if(typeof nF =='function' && nF({req,res,request:req,status:NOT_FOUND,response:res}) == false) return;
            res.status(405).json({message:"Page Non trouvée!! impossible d'exécuter la requête pour la méthode [{0}]; url : {1}, la où les méthodes supportées pour la requête sont : {2}".sprintf(req.method,req.url,methods.join(","))});
            return
        }
        if(withCors !== false){
            await cors(req,res);
        }
        return typeof handler =='function'? handler(req,res) : null;
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