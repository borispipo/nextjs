import {providers} from "$nauth";
import {SUCCESS} from "$capi/status";
import {isObj} from "$cutils";
/**
 * @api {get} auth/providers lister les providers d'autentification
 * @apiName {Get Providers}
 * @apiGroup auth
 * @apiVersion 1.0.0
 * 
 * @apiSuccess {object} data : la liste des providers supportés par l'application  
 */
export default function handler(req,res){
    const prov = Object.clone(providers);
    Object.map(prov,(p)=>{
        if(isObj(p)){
            for(let k in p){
                if(typeof p[k] =='function'){
                    delete p[k];
                }
            }
        }
    });
    return res.status(SUCCESS).json({data:prov})
}