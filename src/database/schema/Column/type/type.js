export const  int = { 
	type : "int",
    sourceTypes : ["mysql", "mssql", "oracle", "sqlite", "sap"]
}; 
export const int2  = { 
    type : "int2",
    sourceTypes : ["postgres", "sqlite", "cockroachdb"]
}; 
export const  int4 = { 
	type : "int4",
    sourceTypes : ["postgres", "cockroachdb"]
}; 
export const  int8 = { 
	type : "int8",
    sourceTypes : ["postgres", "sqlite", "cockroachdb"]
}; 
export const  integer = { 
	type : "integer",
    sourceTypes : ["postgres", "oracle", "sqlite", "mysql", "cockroachdb", "sap"]
}; 
export const  tinyint = { 
	type : "tinyint",
    sourceTypes : ["mysql", "mssql", "sqlite", "sap"]
}; 
export const  smallint = { 
	type : "smallint",
    sourceTypes : ["mysql", "postgres", "mssql", "oracle", "sqlite", "cockroachdb", "sap"]
}; 
export const   mediumint = { 
	type : "mediumint",
    sourceTypes : ["mysql", "sqlite"]
}; 
export const   bigint = { 
	type : "bigint",
    sourceTypes : ["mysql", "postgres", "mssql", "sqlite", "cockroachdb", "sap"]
}; 
export const   dec = { 
	type : "dec",
    sourceTypes : ["oracle", "mssql", "sap"]
}; 
export const   decimal = { 
	type : "decimal",
    sourceTypes : ["mysql", "postgres", "mssql", "sqlite", "sap"]
}; 
export const   smalldecimal = { 
	type : "smalldecimal",
    sourceTypes : ["sap"]
}; 
export const   fixed = { 
	type : "fixed",
    sourceTypes : ["mysql"]
}; 
export const   numeric = { 
	type : "numeric",
    sourceTypes : ["postgres","mssql", "sqlite", "spanner"]
}; 
export const   number = { 
	type : "number",
    sourceTypes : ["oracle"]
}; 