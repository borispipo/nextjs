import {buildSQLWhere as cBuildSQLWhere} from "$cutils/filters";
import defaultDataSource from "$ndataSources/default";

import {extendObj,isObj,isNonNullString,defaultStr,defaultVal} from "$cutils";

export const buildSQLWhere = (whereClause,withStatementParams,fields,opts)=>{
    fields = Object.assign({},fields);
    opts = extendObj({},{
        dataSourceType : defaultStr(opts?.dataSourceType,defaultDataSource),
        getDatabaseColumnName : ({field})=>{
            const f = fields[field];
            if(!isObj(f)) return null;
            if(isNonNullString(f.databaseTableName)){
                return `${f.databaseTableName}.${f.name}`;
            }
            return f.name;
        }
    },opts);
    return cBuildSQLWhere(whereClause,withStatementParams,fields,opts);
}

/**** permet de construire une requête sql à partir des données passées en paramètre
    @param {object} de la forme : {
        fields {object}, les champs à utiliser pour construire la requête
        joins {Array}, tableau des chaines de jointures à utiliser
        databaseTableName {string}, le nom de la table  mère en base de données sur laquelle s'efffecture la requête
        where {Array}, tableau des closes where via laquele la requête where peut se faire
        groupBy {Array}, arrays des closes de groupement
        offset {number}, l'offset
        limit {number}, la limite de la page
    }
*/
export const buildQuery = ({fields,withTotal,allFields,joins,where,sort,databaseTableName,withStatementParams,Model,...queryOptions})=>{
    if(!isObj(allFields)) allFields = isObj(fields)? fields : {};
    const ffields = {};
    if(Array.isArray(fields)){
        let hasField = false;
        fields.map((f)=>{
            if(isNonNullString(f) && f.trim() in allFields){
                hasField = true;
                ffields[f] = allFields[f.trim()]; 
            }
        });
        fields = hasField && ffields || fields;
    }
    fields = isObj(fields)? fields : allFields;
    where = Array.isArray(where) ? buildSQLWhere(where,withStatementParams,allFields,queryOptions) : "";
    joins = Array.isArray(joins)? joins : [];
    const queryFields = [];
    const limit = typeof queryOptions.limit =='number'? queryOptions.limit : parseInt(queryOptions.limit) || 0;
    const limitStr = limit && limit >= 1 && ` LIMIT ${Math.floor(limit)} `|| null;
    const offset = defaultVal(queryOptions.offset,queryOptions.page);
    const off = typeof offset =='number'? offset : parseInt(offset) || 0;
    const offsetStr = off && off >= 0 && ` OFFSET ${offset(Math.floor(off))}`;
    let sortStr = "",groupByStr = "";
    if(isObj(sort) && isNonNullString(sort.column)){
        const sortObj = fields[sort.column] || allFields[sort.column];
        const sortDir = isNonNullString(sort.dir) && sort.dir.toLowerCase().contains("desc") ? "DESC" : "ASC";
        if(isObj(sortObj) && isNonNullString(sortObj.name) && sortObj.databaseTableName){
            sortStr = `ORDER BY ${sortObj.databaseTableName}.${sortObj.name} ${sortDir.toUpperCase()}`;
        }
    }
    databaseTableName = defaultStr(databaseTableName,Model?.Entity?.tableName);
    Object.map(fields,(field,columnField)=>{
        if(isObj(field) && isNonNullString(field.databaseTableName) && isNonNullString(field.name)){
            queryFields.push(`${field.databaseTableName.trim()}.${field.name} AS "${columnField}"`);
        }
    });
    if(queryFields.length && databaseTableName){
        const q = `SELECT {0} FROM ${databaseTableName}  ${joins.length && joins.join(" ")} ${where && ` WHERE ${where}` ||''} ${sortStr && sortStr || ''}  {1} ${groupByStr && groupByStr ||''};`
        const build = q.sprintf(`${queryFields.join(",")} `,`${limitStr && `${limitStr} ${offsetStr && offsetStr ||""}` || ''}`);
        if(withTotal){
            return [
                build,
                q.sprintf("count(*) as count","")
            ]
        }
        return build;
    }
    if(withTotal) return [];
    return "";
}

export const buildSQLQuery = buildQuery;