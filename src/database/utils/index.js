import {buildSQLWhere as cBuildSQLWhere} from "$cutils/filters";
import defaultDataSource from "$ndataSources/default";

import {extendObj,isObj,isNonNullString,defaultStr,defaultVal,defaultObj} from "$cutils";

export const buildSQLWhere = (whereClause,statementsParams,fields,opts)=>{
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
    return cBuildSQLWhere(whereClause,statementsParams,fields,opts);
}

/**** permet de construire une requête sql à partir des données passées en paramètre
    @param {object} de la forme : {
        queryBuilder {function}, le générateur de requête typeorm
        fields {object}, les champs à utiliser pour construire la requête
        joins {Array}, tableau des chaines de jointures à utiliser
        databaseTableName {string}, le nom de la table  mère en base de données sur laquelle s'efffecture la requête
        queryCount {boolean}, si true, alors la requête count sera utilisée
        where {Array}, tableau des closes where via laquele la requête where peut se faire
        groupBy {Array}, arrays des closes de groupement
        offset {number}, l'offset
        limit {number}, la limite de la page
    }
*/
export const buildQuery = ({fields,withTotal,allFields,joins,queryCount,where,sort,databaseTableName,queryBuilder:builder,statementsParams,...queryOptions})=>{
    if(!isObj(allFields)) allFields = isObj(fields)? fields : {};
    queryCount = !!queryCount;
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
    const hasQueryBuilder = builder && typeof builder?.orderBy =="function";
    if(hasQueryBuilder){
        statementsParams = defaultObj(statementsParams);
    }
    where = buildSQLWhere(where,statementsParams,allFields,queryOptions) || '';
    joins = Array.isArray(joins)? joins : [];
    const queryFields = [];
    const limit = queryCount ? 0 : Math.floor(typeof queryOptions.limit =='number'? queryOptions.limit : parseInt(queryOptions.limit) || 0);
    const hasLimit = limit && limit >= 1;
    if(hasLimit && hasQueryBuilder){
        builder.limit(limit);
    }
    const limitStr = !hasQueryBuilder && hasLimit && ` LIMIT ${limit} `|| null;
    const offset = queryCount ? 0 : defaultVal(queryOptions.offset,queryOptions.page);
    const off = Math.floor(typeof offset =='number'? offset : parseInt(offset) || 0);
    const hasOffset = off && off >= 0;
    const offsetStr =  !hasQueryBuilder && hasOffset && ` OFFSET ${off}`;
    if(hasOffset && hasQueryBuilder){
        builder.offset(off);
    }
    let sortStr = "",groupByStr = "";
    if(isObj(sort) && isNonNullString(sort.column)){
        const sortObj = fields[sort.column] || allFields[sort.column];
        const sortDir = isNonNullString(sort.dir) && sort.dir.toLowerCase().contains("desc") ? "DESC" : "ASC";
        if(isObj(sortObj) && isNonNullString(sortObj.name) && sortObj.databaseTableName){
            const sortCol = `${sortObj.databaseTableName}.${sortObj.name}`;
            if(hasQueryBuilder){
                builder.orderBy(sortCol,sortDir.toUpperCase());
            } else {
                sortStr = `ORDER BY ${sortCol} ${sortDir.toUpperCase()}`;
            }
        }
    }
    databaseTableName = defaultStr(databaseTableName);
    Object.map(fields,(field,columnField)=>{
        if(isObj(field) && isNonNullString(field.databaseTableName) && isNonNullString(field.name)){
            queryFields.push(`${field.databaseTableName.trim()}.${field.name} AS "${columnField}"`);
        }
    });
    if(!hasQueryBuilder){
        if(queryFields.length && databaseTableName){
            const q = `SELECT {0} FROM ${databaseTableName}  ${joins.length && joins.join(" ")} ${where && ` WHERE ${where}` ||''} ${sortStr && sortStr || ''}  {1} ${groupByStr && groupByStr ||''};`
            return q.sprintf(queryCount?"count(*) as count":`${queryFields.join(",")} `,`${limitStr && `${limitStr} ${offsetStr && offsetStr ||""}` || ''}`);
        }
        return "";
    }
    if(queryFields.length && databaseTableName){
        builder.select(queryFields).from(databaseTableName);
        if(where){
            builder.where(where,statementsParams);
        }
    }
    return builder;
}

export const buildSQLQueryCount = (opts,...rest)=>{
    return buildQuery({...Object.assign({},opts),queryCount:true},...rest);
}

export const buildQueryCount = buildSQLQueryCount;

export const buildSQLQuery = buildQuery;