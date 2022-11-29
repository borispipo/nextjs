import {isObj,defaultObj,defaultStr,isNonNullString,isNumber,isBool} from "$utils";
import {getDataSource,isDataSource} from "../dataSources";
import {buildWhere} from "$cutils/filters";

/**** crèe un schemas de base de données 
 * @see : https://typeorm.io/usage-with-javascript
 * @see : https://github.com/typeorm/typeorm/blob/master/src/entity-schema/EntitySchemaOptions.ts for schemas properties
 * @param {object} les options à utiliser pour la création du schema : objet de la forme : 
 *      name {string}  : Will use table name as default behaviour.
 *      les différentes colonnes sont des propriétés de la forme : EntitySchemaColumnOptions : {}, voir le fichier ./Column
*/
export default class BaseModel {
    ///les champs de la base de données
    static fields;
    static tableName;//Table name.
    static name;
    static relations; //Entity relation's options.
    static dataSource;
    static name;
    static isIntialized;
    static activeRepository;
    static Entity; //l'entity associé au model
    static init(options){
        options = typeof options =='object' && options && !Array.isArray(options)? options : {};
        const fields = defaultObj(this.fields,options.fields,options.columns);
        if(!Object.size(this.fields,true)){
            this.fields = fields;
        }
        this.isIntialized = true;
        return getDataSource(options).then((d)=>{
            this.dataSource = d;
            return d;
        })
    }
    /*** effectue une requête en base de données avec les options passés en paramètre */
    static buildWhere (whereClause,withStatementParams,fields){
        fields = isObj(fields)? fields : this.fields;
        return buildWhere(whereClause,withStatementParams,fields)
    }

    static initialize (options){
        return this.init(options);
    }
    /***validate les données pour la mise à jour */
    static validate (options){
        options = defaultObj(options);
        const data = defaultObj(options.data);
        const result = {};
        const fields = this.fields;
        const {filter,breakOnError} = options;
        let error = false,message  = '',status = undefined;
        for(let i in fields){
            const field = fields[i];
            if(!isObj(field)) continue;
            if(!(i in data)) continue;
            const value = data[i];
            if(typeof filter =='function' && filter({field,fields:fields,index:i,columnField:i,name:field.name,columnDef:field,value:data[i]}) == false) {
                continue;
            }
            const fieldTitle = defaultStr(field.title,field.label);
            if(field.nullable === false && value == null && !isNonNullString(value) && !isNumber(value) && !isBool(value)){
                error = true;
                message = "Le champ [{0}] est requis".sprintf(fieldTitle);
            }
            if(typeof field.length =='number' && field.length && (value+"").length > field.length){
                error = true;
                message = "Le champ [{0}] doit avoir une longueur de {1} caractères maxmimum".sprintf(fieldTitle,field.length);
            }
            if(error == true && breakOnError !== false){
                break;
            }
            result[i] = data[i];
        }
        return {data:result,error,status,message};
    }
    static getRepository(force){
        if(this.activeRepository && force !== true) return Promise.resolve(this.activeRepository);
        if(!this.isIntialized || !isDataSource(this.dataSource)){
            return this.init().then((dataSource)=>{
                this.dataSource = dataSource;
                this.activeRepository = this.dataSource.getRepository(this.Entity);
                return this.activeRepository;
            });
        }
        this.activeRepository = this.dataSource.getRepository(this.Entity);
        return Promise.resolve(this.activeRepository);
    }
    static get repository(){
        return this.dataSource.getRepository(this.Entity);
    } 
    static get manager (){
        return this.dataSource.manager;
    }
    /*** crère le query builder pour effectuer les requête typeorm */
    static createQueryBuilder(){
        return this.getRepository().then(r=>r.createQueryBuilder());
    }
    /*** retourne un object typeORM selectQueryBuilder query avec les paramètres pris en paramètres
     * @return {object} queryOptions, les options de la requête
     * @param {bool|object} withStatementParams
     * @param {object} fields
     */
    static buildQuery(queryOptions,withStatementParams,fields){
        return new Promise((resolve,reject)=>{
            this.createQueryBuilder().then((builder)=>{
                queryOptions = isObj(queryOptions)? queryOptions : {};
                const sort = isObj(queryOptions.sort) ? queryOptions.sort : queryOptions.orderBy;
                fields = isObj(fields)? fields : this.fields;
                const where = this.buildWhere(queryOptions.where,withStatementParams,fields);
                if(where){
                    builder.where(where);
                }
                if(typeof queryOptions.limit =='number' && queryOptions.limit){
                    builder.limit(queryOptions.limit);
                }
                const offset = typeof queryOptions.page =='number' && queryOptions.page || typeof queryOptions.offset =='number' && queryOptions.offset || undefined;
                if(offset && typeof offset =='number'){
                    builder.offset(offset);
                }
                if(isObj(sort) && isNonNullString(sort.column)){
                    const sortDir = isNonNullString(sort.dir) && sort.dir.toLowerCase().contains("desc") ? "DESC" : "ASC";
                    if(isObj(fields) && isObj(fields[sort.column])){
                        const sortColumn = fields[sort.column];
                        if(isNonNullString(sortColumn.name)){
                            builder.orderBy(sortColumn.name,sortDir);
                        }
                    }
                }
                resolve(builder);
            }).catch(reject)
        })
    }
    /*** effectue une requête query avec les paramètres issues de la requête query du queryBuidler
     * retourne plusieurs données résultat
     */
    static queryMany (queryOptions,withStatementParams,fields){
        return new Promise((resolve,reject)=>{
            this.buildQuery(queryOptions,withStatementParams,fields).then((builder)=>{
                builder.getMany().then(resolve).catch(reject);
            }).catch(reject);
        })
    }
    static queryOne (queryOptions,withStatementParams,fields){
        return new Promise((resolve,reject)=>{
            this.buildQuery(queryOptions,withStatementParams,fields).then((builder)=>{
                builder.getOne().then(resolve).catch(reject);
            }).catch(reject);
        })
    }
}
