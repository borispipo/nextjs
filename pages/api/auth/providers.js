import {providers} from "$nauth";
import {SUCCESS} from "$capi/status";
import {isObj} from "$cutils";
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