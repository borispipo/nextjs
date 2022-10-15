import providersExport  from "$providers";

const providers = Array.isArray(providersExport)? providersExport : [];

export default providers;

export const getProvider = (providerId)=>{
    if(typeof providerId !=='string') return null;
    providerId = providerId.toLowerCase().trim();
    for(let i in providers){
        const c = providers[i];
        if(typeof c =='object' && c && !Array.isArray(c)){
            if(typeof c.id =='string' && c.id.toLowerCase().trim() == providerId) return c;
        }
    }
    return null;
}

export const init = ()=>{
    providers.map((provider)=>{
        if(typeof provider =="object" && provider && !Array.isArray(provider)){
            provider.initialize();
        }
    })
}