
import isNonNullString from "$cutils/isNonNullString";
import defaultStr from "$cutils/defaultStr";
import "$cutils";
import defaultDataSource from "./default";

export * from "./types/exports";

export * as dataSourceTypes from "./types/exports";

export const isDefault = (type)=> isNonNullString(type) && type.trim().toLowerCase() == defaultDataSource ? true : false;
/***
 * retourne les options de connexion à la base de données via le dataSource
 * les data sources d'un type particulier sont préfixés dans la variable d'environnement par : 
 *  DB_[DATA_SOURCE_TYPE]_[PROPERTY] 
 *      où DATA_SOURCE_Type représente le type de source de données (exemple : MYSQL),
 *         PROPERTY représente la propriété à appliquer à la source de données (exemple : HOST)
 *      par exemple : DB_MYSQL_HOST : représente la propriété host pour la source de données mysql
 *  les propriétés définnies pour la source de données par défaut (variable process.env.DEFAULT_DB_DATA_SOURCE_TYPE ou mysql)
 *  non pas besoin d'être préfixés. 
 *  ainsi, la variables d'environnement DB_HOST représente l'hôte de la source de données par défaut. 
 */
export const getConfig = (options)=>{
    options = options || {};
    const dataSourceType = defaultStr(options.type,options.dataSource,defaultDataSource).trim().toLowerCase();
    const dataSourcePrefix = dataSourceType.toUpperCase().ltrim("_").rtrim("_");
    const isDef = isDefault(dataSourceType);
    const opts = {};
    ["HOST","TYPE","USERNAME","PASSWORD","DATABASE","PORT"].map(v=>{
        const vv = v.toUpperCase();
        const prefix = "DB_"+dataSourcePrefix+"_"+vv;
        const key = v.toLowerCase();
        const keyV = "DB_"+vv;
        if(process.env[prefix]){
            opts[key] = process.env[prefix];
        } else if(isDef && process.env[keyV]){
            opts[key] = process.env[keyV];
        }
        if(vv=="TYPE" && opts[key] && typeof opts[key] =='string'){
            opts[key] = opts[key].toLowerCase().trim();
        }
    });
    options = typeof options =='object' && options && !Array.isArray(options)? options : {};
    options = {
        synchronize: false,
        ...options,
        type : dataSourceType,
        ...opts,
    };
    options.port = typeof options.port =='string'? parseInt(options.port) || options.port : options.port;
    return options;
};

export const getOptions = getConfig;

export const isValidDataSource = (dataSource)=>{
    return dataSource && typeof dataSource !=='boolean' && typeof dataSource.getRepository =='function'? true : false;
}
export const isDataSource = isValidDataSource;

export const optionsToString = (opts)=>{
    if(typeof opts !=='object' || !opts) return null;
    const founded = {};
    const r = "dbDataSourceID-"+["TYPE","HOST","PORT","DATABASE","USERNAME"].map((o)=>{
        o= o.toLowerCase();
        const v = opts[o] && opts[o].toString().trim();
        founded[o] = v;
        return v;
    }).join("--").replace(/\s/g, "X");//replace all whitesspaces
    return founded.host && founded.username && r || null;
}