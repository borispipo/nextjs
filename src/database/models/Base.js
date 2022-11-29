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
        withStatementParams = typeof withStatementParams =='boolean'? withStatementParams : true;
        fields = isObj(fields)? fields : this.fields;
        return buildWhere(whereClause,true,withStatementParams,fields)
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
    static getRepository(){
        if(this.activeRepository) return this.activeRepository;
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
        return this.getRepository().then((r)=>{
            return r.createQueryBuilder(this.tableName);
        });
    }
}
