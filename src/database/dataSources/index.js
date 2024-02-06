import "reflect-metadata";
import { DataSource } from "typeorm";
import defaultStr from "$cutils/defaultStr";
import {mysql} from "./types/exports";
import { isDataSource,optionsToString,defaultDataSource as defaultDataSourceType,isDefault,getOptions} from "./utils";
import entities from "../models/entities";
import Logger from "../Logger";

let defaultDataSource = null;

export * from "./utils";

/*if(!globalThis.allDataSourceManager || typeof globalThis.allDataSourceManager !=='object'){
    Object.defineProperties(globalThis,{
        allDataSourceManager : {
            value : {},
        }
    })
}

const ALL = globalThis.allDataSourceManager;*/


/**** récupère une source de données puis l'initialize */
export const getDataSource = (options)=>{
    options = typeof options =='object' && options && !Array.isArray(options)? options : {};
    let {force,type,...opts} = options;
    type = defaultStr(type,defaultDataSourceType).toLowerCase().trim();
    opts.type = type;
    opts.entities = Array.isArray(opts.entities) && opts.entities.length ? opts.entities : entities;
    opts.logging = (typeof opts.logging =='boolean' || Array.isArray(options.logging) && options.logging.length)? opts.logging : true;
    const isDev = String(process.env.NODE_ENV).toLowerCase().trim() !== 'production';
    if(opts.logger && !isDev && !options.logger){
        options.logger =  new Logger();
    }
    opts = getOptions(opts);
    const dsString = optionsToString(opts);
    if(!dsString){
        delete opts.password;
        delete opts.pass;
        const _opts = {};
        for(let i in opts){
            const o = opts[i];
            if(typeof o !=='object' && typeof o !== 'function'){
                _opts[i] = o;
            }
        }
        throw ({message:'Options de la source de base de données invalide!! merci de spécifier les options valide pour la source de données',options:_opts})
    }
    if ((dsString in global) && (isDev || isDataSource(global[dsString]))) {
        return Promise.resolve(global[dsString]);
    }
    const dataSource = new DataSource(opts);
    dataSource.type = opts.type;
    if(isDefault){
        defaultDataSource = dataSource;
    }
    return dataSource.initialize().then((d)=>{
        global [dsString] = d;
        d.dataSourceType = d.type = opts.type;
        return d;
    });
}


export const DataSources = {
    get default (){
        return defaultDataSource;
    },
    get get() {
        return get;
    }
}

export default DataSources;

export const dataSourceTypes = {
    mysql,
}
