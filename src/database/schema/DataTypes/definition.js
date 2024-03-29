/***
 * @see : https://github.com/typeorm/typeorm/blob/master/src/driver/types/ColumnTypes.ts
*/
import {mysql,sqlite, postgres, mssql,mariadb, oracle, cockroachdb, sap} from "$dataSources/types";
import defaultDataSource from "../../dataSources/default";

export const STRING = {
    type : "varchar",
    sql : "VARCHAR(255)",
    js : "text",
    dataSourceTypes : {mysql,mariadb, postgres, mssql, sqlite, cockroachdb},
}

export const TEXT = {
    type :"text",
    sql : "TEXT",
    js : "text",
    dataSourceTypes : {mysql,mariadb, postgres, mssql, sqlite, cockroachdb, sap}
}
export const TINYTEXT = {
    ...TEXT,
    type : "tinytext",
    sql : "tinytext",
    dataSourceTypes : {mysql,mariadb},
    sql : "TINYTEXT",
}
export const MEDIUMTEXT = {
    ...TEXT,
    type :"mediumtext",
    sql : "mediumtext",
    dataSourceTypes : {mysql,mariadb},
}
export const LONGTEXT = {
    ...TEXT,
    type : "longtext",
    sql : "longtext",
    dataSourceTypes : {mysql,mariadb},
}

export const CHAR = {
    ...TEXT,
    type : "char",
    sql : "CHAR(255)",
    dataSourceTypes : {mysql, postgres, mssql, oracle, cockroachdb, sap}
}

export const TINYINT = {
    type : "tinyint",
    sql : "TINYINT",
    js : "number",
    dataSourceTypes : {mysql,mariadb},
    width : 1,
}
export const SMALLINT = {
    ...TINYINT,
    type :"smallint",
    sql : "SMALLINT",
    dataSourceTypes : {mysql,mariadb,postgres},
}

export const MEDIUMINT =  {
    ...SMALLINT,
    type : "mediumint",
    sql : "mediumint",
}

export const INTEGER = {
    ...SMALLINT,
    type : "integer",
    sql : "integer",
    dataSourceTypes : {postgres, oracle, sqlite, mysql, cockroachdb, sap},
}

export const BIGINT = {
    ...INTEGER,
    get type(){
        return  "bigint";
    },
    sql : "bigint",
    type : "bigint",
}

export const REAL = {
    ...MEDIUMINT,
    type : 'real',
    sql :'real',
    type : "real",
    dataSourceTypes : {mysql, postgres, mssql, oracle, sqlite, cockroachdb, sap}
}

export const FLOAT = {
    ...REAL,
    type :'float',
    sql  :'float',
}
export const DOUBLE = {
    ...FLOAT,
    type : "double",
    sql:'double',
    dataSourceTypes: {mysql, sqlite}
}
export const DOUBLE_PRECISION = {
    ...DOUBLE,
    type :"double precision",
    sql : "double precision",
    dataSourceTypes : {postgres, oracle, sqlite, mysql,mariadb, cockroachdb},
}

export const DECIMAL = {
    ...DOUBLE,
    sql : "decimal",
    type : "decimal",
    dataSourceTypes: {mysql,mariadb, postgres, mssql, sqlite, sap}
}

export const DATE = {
    type :"date",
    sql : "date",
    js : "date",
    dataSourceTypes : {mysql,mariadb, postgres, mssql, sqlite, cockroachdb, sap}
}
export const TIME = {
    ...DATE,
    type :"time",
    sql : "time",
    js : "time",
}
export const DATETIME = {
    ...DATE,
    type :"datetime",
    sql : "datetime",
    js : "datetime",
}
export const TIMESTAMP = {
    ...DATE,
    type : "timestamp",
    sql:"timestamp",
    js : "datetime"
}
export const SMALLDATETIME = {
    ...DATE,
    type :"smalldatetime",
    sql : "smalldatetime",
    js : "datetime",
}

export const SWITCH = {
    type : "int",
    sql : "int",
    js : "switch",
    dataSourceTypes : {mysql,mariadb, postgres, mssql, sqlite, cockroachdb},
}

export const CHECKBOX = {
    type : "int",
    sql : "int",
    js : "checkbox",
    dataSourceTypes : {mysql,mariadb, postgres, mssql, sqlite, cockroachdb},
}

export const JSON = {
    type : "json",
    dataSourceTypes : {mysql, postgres, cockroachdb},
    sql : "json",
    js : "object",
}

export const JSONB = {
    type : "jsonb",
    dataSourceTypes : {postgres, cockroachdb},
    sql : "jsonb",
    js : "object",
}