import {providers} from "$nauth";
import {SUCCESS} from "$capi/status";
import {isObj} from "$cutils";
/**
 * @api {get} auth/providers liste les providers d'autentification
 * @apiName {Get Providers}
 * @apiGroup auth
 * 
 * @apiSuccess {object} data : la liste des providers supportés par l'application  
 */
export default function handler(req,res){
    for(let i in providers){
        const p = providers[i];
        if(isObj(p)){
            for(let k in p){
                if(typeof p[k] =='function'){
                    delete p[k];
                }
            }
        }
    }
    return res.status(SUCCESS).json({data:providers})
}