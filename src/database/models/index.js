import allModels from "$models/all";

export * from "./Base";

export * from "./utils";

export * from "./entities";

export {default as Base} from "./Base";

export {default as entities} from "./entities";

const all = Array.isArray(allModels) || allModels && typeof allModels =='object' && allModels ||  [];

/*** récupère un models parmis la liste passée en paramètre
 * 
 */
 export const getOneModel = (name,fromModels)=>{
    if(typeof name !== 'string' || !name) return null;
    name = name.toLowerCase().trim();
    fromModels = Array.isArray(fromModels)? fromModels : all;
    for(let i in fromModels){
        const model = fromModels[i];
        if(!model || typeof model.name !=='string') continue;
        if(model.name.toLowerCase().trim() == name) return model;
    }
    return null;
}

/*** permet de récupérer la liste des models en fonction du filtre */
export const getManyModels = (filter,fromModels)=>{
    const r = [];
    const f = filter;
    fromModels = Array.isArray(fromModels)? fromModels : all;
    filter = typeof filter =='function'? filter : 
        typeof filter =='string'? (model)=> model.name.toLowerCase().trim() == f.toLowerCase().trim() :
        Array.isArray(filter)? (model)=>{
            for(let i in f){
                if(typeof f[i] == 'string' && model.name.toLowerCase().trim() == f[i].toLowerCase().trim()) return model;
            }
            return null;
        } : undefined;
    if(!filter) return all;
    fromModels.map(model=>{
        if(!(model) || model === true || typeof model.name !='string') return;
        if(filter(model,model.name) === false) return;
        r.push(model);
    })
    return r;
}

export {all as allModels};