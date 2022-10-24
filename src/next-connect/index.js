/***@see : https://github.com/hoangvvo/next-connect */
import { createRouter as nCreateRouter } from "next-connect";
import {defaultObj} from "$utils";
import {INTERNAL_SERVER_ERROR,NOT_FOUND} from "$api/status";

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
                console.log(req?.nextUrl?.pathname || req.url," not route found ",req)
                if(typeof nF =='function' && nF({req,res,request:req,status:NOT_FOUND,response:res}) == false) return;
                res.status(NOT_FOUND).json({message:"Page Non trouvée!! impossible d'exécuter la requête pour la méthode [{0}]; url : {1}".sprintf(req.method,req.url)});
            },
        })
    };
    return router;
}

export {createRouter};