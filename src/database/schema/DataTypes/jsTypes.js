// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

module.exports.STRING = {
    type : "varchar",
    sql : "VARCHAR(255)",
    js : "text",
}

module.exports.TEXT = {
    type :"text",
    sql : "TEXT",
    js : "text",
}
module.exports.TINYTEXT = {
    ...module.exports.TEXT,
    type : "tinytext",
    sql : "tinytext",
    sql : "TINYTEXT",
}
module.exports.MEDIUMTEXT = {
    ...module.exports.TEXT,
    type :"mediumtext",
    sql : "mediumtext",
}
module.exports.LONGTEXT = {
    ...module.exports.TEXT,
    type : "longtext",
    sql : "longtext",
}

module.exports.CHAR = {
    ...module.exports.TEXT,
    type : "char",
    sql : "CHAR(255)",
}

module.exports.TINYINT = {
    type : "tinyint",
    sql : "TINYINT",
    js : "number",
    width : 1,
}
module.exports.SMALLINT = {
    ...module.exports.TINYINT,
    type :"smallint",
    sql : "SMALLINT",
}

module.exports.MEDIUMINT =  {
    ...module.exports.SMALLINT,
    type : "mediumint",
    sql : "mediumint",
}

module.exports.INTEGER = {
    ...module.exports.SMALLINT,
    type : "integer",
    sql : "integer",
}

module.exports.BIGINT = {
    ...module.exports.INTEGER,
    type : "bigint",
    sql : "bigint",
    type : "bigint",
}

module.exports.REAL = {
    ...module.exports.MEDIUMINT,
    type : 'real',
    sql :'real',
    type : "real",
}

module.exports.FLOAT = {
    ...module.exports.REAL,
    type :'float',
    sql  :'float',
}
module.exports.DOUBLE = {
    ...module.exports.FLOAT,
    type : "double",
    sql:'double',
}
module.exports.DOUBLE_PRECISION = {
    ...module.exports.DOUBLE,
    type :"double precision",
    sql : "double precision",
}

module.exports.DECIMAL = {
    ...module.exports.DOUBLE,
    sql : "decimal",
    type : "decimal",
}

module.exports.DATE = {
    type :"date",
    sql : "date",
    js : "date",
}
module.exports.TIME = {
    ...module.exports.DATE,
    type :"time",
    sql : "time",
    js : "time",
}
module.exports.DATETIME = {
    ...module.exports.DATE,
    type :"datetime",
    sql : "datetime",
    js : "datetime",
}
module.exports.TIMESTAMP = {
    ...module.exports.DATE,
    type : "timestamp",
    sql:"timestamp",
    js : "datetime"
}
module.exports.SWITCH = {
    type : "int",
    sql : "int",
    js : "switch",
}

module.exports.CHECKBOX = {
    type : "int",
    sql : "int",
    js : "checkbox",
}

module.exports.JSON = {
    type : "json",
    sql : "json",
    js : "object",
}

module.exports.JSONB = {
    type : "jsonb",
    sql : "jsonb",
    js : "object",
}