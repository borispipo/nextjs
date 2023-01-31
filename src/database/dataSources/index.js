import "reflect-metadata";
import { DataSource } from "typeorm";
import defaultStr from "$cutils/defaultStr";
import {mysql} from "./types";
import { isDataSource,optionsToString,defaultDataSource as defaultDataSourceType,isDefault,getOptions} from "./utils";
import entities from "../models/entities";

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
    opts.logging = typeof opts.logging =='boolean'? opts.logging : process.env.NODE_ENV =='development'? true : false;
    opts = getOptions(opts);
    return registrerDatatSource(opts);
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

/*
    Fix too many connections problem
 * Register service.
 * @description Stores instances in `global` to prevent memory leaks in development.
 * @options {object} opts dataSource options.
 * @return {Promise.resolve<Datasource>} dataSourceInstance.
 */
const registrerDatatSource = (opts) => {
    return new Promise((resolve,reject)=>{
        const dsString = optionsToString(opts);
        if(!dsString){
            delete opts.password;
            delete opts.pass;
            return reject({message:'Options de la source de données invalide!! merci de spécifier les options valide pour la source de données',opts})
        }
        const isDev = process.env.NODE_ENV === 'development';
        if (isDev) {
            if ((dsString in global)) {
               return resolve(global[dsString]);
            }
        }
        const dataSource = new DataSource(opts);
            if(isDefault){
                defaultDataSource = dataSource;
            }
            dataSource.type = opts.type;
            return dataSource.initialize().then((d)=>{
                if(isDev){
                    global [dsString] = d;
                }
                return d;
            });
     })
  };