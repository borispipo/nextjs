// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export {default as DataTypes} from "./DataTypes";

import {EntitySchema} from "typeorm";

/**** crèe un schemas de base de données 
 * @see : https://typeorm.io/usage-with-javascript
 * @see : https://github.com/typeorm/typeorm/blob/master/src/entity-schema/EntitySchemaOptions.ts for schemas properties
 * @see : https://github.com/typeorm/typeorm/blob/master/src/entity-schema/EntitySchemaColumnOptions.ts
 * @param {object} les options à utiliser pour la création du schema : objet de la forme : 
 *      name {string}  : Will use table name as default behaviour.
 *      tableName {string} : // Optional: Provide `tableName` property to override the default behaviour for table name.
 *      columns {objectOf[{EntitySchemaColumnOptions}]} : //les colonnes de la table dans la bd
 *      fields {object} : alias à columns
 *      database? {string} : Database name. Used in MySql and Sql Server.
 *      schema? {string}  : Schema name. Used in Postgres and Sql Server
 *      type ? {TableType} : 
 *      les différentes colonnes sont des propriétés de la forme : EntitySchemaColumnOptions : {}, voir le fichier ./Column
*/
export const createSchema = (options)=>{
    options = typeof options =='object' && options && !Array.isArray(options)? options : {};
    const fields = typeof options.columns =='object' && options.columns && !Array.isArray(options.columns)? options.columns : typeof options.fields =='object' && !Array.isArray(options.fields)? options.fields : {};
    const schema = new EntitySchema({
        ...options,
        columns : fields,
    });
    schema.fields = fields;
    schema.tableName = schema.tableName || options.tableName;
    schema.name = schema.name || options.name;
    return schema;
}
export const createEntity = createSchema;

export const createModel = createSchema;