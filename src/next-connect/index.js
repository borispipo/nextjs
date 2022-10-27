/***@see : https://github.com/hoangvvo/next-connect */
import { createRouter as nCreateRouter } from "next-connect";
import {defaultObj} from "$utils";
import {INTERNAL_SERVER_ERROR,NOT_FOUND} from "$api/status";
import cors from "../cors";

export * from "next-connect";
export default function createRouter(options){
    options = typeof options =='object' && options && !Array.isArray(options)? options : {};
    const {withCors,...restOptions} = options;
    const router = nCreateRouter(restOptions);
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
    
    if(withCors !== false){
        ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "TRACE"].map((v)=>{
            v = v.toLowerCase();
            if(typeof router[v] =='function'){
                const {[v]:func} = router;
                console.log(func," is ffffffffffffffffffffff")
                router[v] = function(pattern,handler){
                    if(typeof pattern =='function'){
                        const t = handler;
                        handler = pattern;
                        pattern = t;
                    }
                    pattern = typeof pattern =='string'? pattern : undefined;
                    const cbF = async function customHandler(){
                        const args = Array.prototype.slice.call(arguments,0);
                        console.log(args," is arguemnt heeeeee")
                        try {
                            await cors(req,res);
                        } catch (e){
                            console.log(e," catching cors error on middleware");
                        }
                        return await handlder.apply(this||router,args);
                    };
                    return pattern ? func (pattern,cbF) : func(cbF);
                };
            }
        });
    }
    return router;
}

export {createRouter};