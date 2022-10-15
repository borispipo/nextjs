import "reflect-metadata";
import { DataSource } from "typeorm";
import defaultStr from "$cutils/defaultStr";
import {mysql} from "./types";
import { isDataSource,defaultDataSource as defaultDataSourceType,isDefault,getOptions} from "./utils";
import entities from "../models/entities";

let defaultDataSource = null;

const ALL = {};

export * from "./utils";


/**** récupère une source de données puis l'initialize */
export const getDataSource = (options)=>{
    options = typeof options =='object' && options && !Array.isArray(options)? options : {};
    let {force,type,...opts} = options;
    type = defaultStr(type,defaultDataSourceType).toLowerCase().trim();
    if(ALL[type] && isDataSource(ALL[type])){
        console.log("has found data source",type);
        return Promise.resolve(ALL[type]);
    }
    opts.type = type;
    opts.entities = Array.isArray(opts.entities) && opts.entities.length ? opts.entities : entities;
    opts.logging = typeof opts.logging =='boolean'? opts.logging : process.env.NODE_ENV =='development'? true : false;
    opts = getOptions(opts);
    const dataSource = new DataSource(opts);
    if(isDefault){
        defaultDataSource = dataSource;
    }
    dataSource.type = type;
    return dataSource.initialize().then((d)=>{
        ALL[type] = d;
        return d;
    });
}


export const DataSources = {
    get default (){
        if(defaultDataSource == null){

        }
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