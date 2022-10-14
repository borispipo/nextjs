export {default} from "./credentials";
import credentials  from "./credentials";

export const getProvider = (providerId)=>{
    if(typeof providerId !=='string') return null;
    providerId = providerId.toLowerCase().trim();
    for(let i in credentials){
        const c = credentials[i];
        if(typeof c =='object' && c && !Array.isArray(c)){
            if(typeof c.id =='string' && c.id.toLowerCase().trim() == providerId) return c;
        }
    }
    return null;
}

export const init = ()=>{
    credentials.map((provider)=>{
        if(typeof provider =="object" && provider && !Array.isArray(provider)){
            provider.initialize();
        }
    })
}