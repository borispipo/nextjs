/***@see : https://github.com/hoangvvo/next-connect */
import { createRouter as nCreateRouter } from "next-connect";
import {defaultObj} from "$utils";
import {INTERNAL_SERVER_ERROR,NOT_FOUND} from "$api/status";
const requestHeaders = require("../../request.headers");

export * from "next-connect";
export default function createRouter(a,b,c){
    const router = nCreateRouter(a,b,c);
    const {handler} = router;
    router.handler = function(options){
        options = defaultObj(options);
        const {onError,onNoMatch,noFound,onNotFound} = options;
        return handler.call(this,{
            ...options,
            onError : (error, req, res) => {
                const status = typeof error.status =='number' && error.status ? error.status : INTERNAL_SERVER_ERROR;
                if(onError && onError({error,req,res,request:req,response:res,status}) === false) return;
                console.error(error, " has found on router error");
                res.status(status).json({error,status,hasError:true,reason:error.reason,message:error.message || error.stack,...defaultObj(error)});
            },
            onNoMatch: (req, res) => {
                const nF = typeof onNoMatch =='function'? onNoMatch : typeof onNotFound =='function'? onNotFound : noFound;
                console.log(req?.nextUrl?.pathname || req.url," not route found ",req.nextUrl)
                if(typeof nF =='function' && nF({req,res,request:req,status:NOT_FOUND,response:res}) == false) return;
                res.status(NOT_FOUND).json({message:"Page Non trouvée!! impossible d'exécuter la requête pour la méthode [{0}]; url : {1}".sprintf(req.method,req.url)});
            },
        })
    };
    return router.use(async (req, res, next) => {
        let oneof = false;
        if(req.headers.origin) {
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
            oneof = true;
        }
        if(req.headers['access-control-request-method']) {
            res.setHeader('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
            oneof = true;
        }
        if(req.headers['access-control-request-headers']) {
            res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
            oneof = true;
        }
        if(oneof) {
            res.setHeader('Access-Control-Max-Age', 60 * 60 * 24 * 365);
        }
        //res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
        for(let i in requestHeaders){
            const header = requestHeaders[i];
            if(typeof header =='object' && header && 'value' in header){
                if(header.isHeader !== false && !res.headers[i]){
                    console.log("setting header ",i),res.headers[i];
                    res.setHeader(header.key,header.value);
                }
            }
        }
        // intercept OPTIONS method
        if (oneof && req.method == 'OPTIONS') {
            res.send(200);
        }
        else {
            await next();
        }
    });
}

export {createRouter};