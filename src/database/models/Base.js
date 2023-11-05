import {isObj,defaultObj,defaultStr,extendObj,defaultVal,isPromise,isNonNullString,isNumber,isBool} from "$utils";
import {getDataSource,isDataSource} from "../dataSources";
import defaultDataSource from "../dataSources/default";
import {buildWhere} from "$cutils/filters";
import Validator from "$lib/validator";
import DateLib from "$date";
import DataTypes from "$schema/DataTypes";
import {FORBIDEN,NOT_FOUND} from "$capi/status";
import { model as ModelEvent } from "../../events";

const notFound = {message:'Valeur non trouvée en base',status:NOT_FOUND}

const getEmitEventArgs = (a,a1)=>{
    return extendObj({},a1,a);
}
/**** crèe un schemas de base de données 
 * @see : https://typeorm.io/usage-with-javascript
 * @see : https://github.com/typeorm/typeorm/blob/master/src/entity-schema/EntitySchemaOptions.ts for schemas properties
 * @see : https://orkhan.gitbook.io/typeorm/docs/find-options from find options
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
    static isIntialized;
    static activeRepository;
    static Entity; //l'entity associé au model
    static get name() { return this.Entity?.name }
    static get tableName() { return this.Entity?.tableName;}
    static get fields() { return this.Entity?.fields; }
    static emitEvent(eventName,opts1,opt2,...rest){
        opts1 = {...defaultObj(opts1),context:this,tableName:this.tableName};
        return ModelEvent.emit(eventName,isObj(opt2) ? getEmitEventArgs(opts1,opt2):opts1,opt2,...rest);
    }
    static emitChangeEvent(action,opt1,opt2,...rest){
        this.emitEvent("change",{action},opt1,opt2,...rest);
    }
    static init(options){
        options = typeof options =='object' && options && !Array.isArray(options)? options : {};
        const fields = defaultObj(this.fields,options.fields,options.columns);
        if(!Object.size(this.fields,true)){
            this.fields = fields;
        }
        this.isIntialized = true;
        return getDataSource(options).then((d)=>{
            this.dataSource = d;
            this.emitEvent("init",{dataSource:d});
            return d;
        })
    }
    static getFields(fields){
        const mFields = this.fields;
        const r = {};
        let hasF = false;
        Object.map(fields,(f,index)=>{
            if(isNonNullString(f)){
                f = f.trim();
                if(f in mFields){
                    r[f] = mFields[f];
                    hasF = true;
                }
            } else if(isObj(f)){
                const code = defaultStr(f.field,index).trim();
                if(code in mFields){
                    r[code] = f;
                    hasF = true;
                }
            }
        });
        return hasF ? r : mFields;
    }
    /*** effectue une requête en base de données avec les options passés en paramètre */
    static buildWhere (whereClause,withStatementParams,fields,opts){
        opts = extendObj({},opts,{
            dataSourceType : defaultStr(this.dataSource?.dataSourceType,defaultDataSource)
        });
        return buildWhere(whereClause,withStatementParams,this.getFields(fields),opts);
    }

    static initialize (options){
        return this.init(options);
    }
    /***validate les données pour la mise à jour
     * @param {object} options les options à paser à la requête
     * @return {Promise<object>} lorsque les donnés on été correctement validées
     * Prise en compte du champ loginId devent être rendu par le provider au moment de l'authentification de l'utilisateur
        le champ loginId permet de garder l'informatioin sur l'id de l'utilisateur connecté à un moment donné il peut être utiliser pour populate les valeurs des champs de type createBy et updateBy
        {
            generatePrimaryKey : {boolean}, si true, la clé primaire sera générée pour les table n'ayant qu'un seul champ de type string comme clé primaire
        } 
    */
    static validate (options){
        options = defaultObj(options);
        const {generatePrimaryKey} = options;
        const pieces = defaultObj(options.pieces);
        const piece = pieces[this.tableName] || pieces[this.tableName.toUpperCase()];
        const data = defaultObj(options.data);
        const session = defaultObj(options.session);
        const loginId = defaultStr(session.loginId).trim();
        const userPiece = defaultStr(session.piece);
        const result = {};
        let fields = this.getFields(options.fields);
        Object.map(this.fields,(f,i)=>{
            if(isObj(f)){
                ["updateDate","updateBy"].map(u=>{
                    if(f[u] === true && !(i in fields)){
                        fields[i] = f;
                    }
                });
            }
        })
        const {filter} = options;
        const errorsMessages = [];
        const promises = [];
        let primaryKey = undefined;
        let primaryKeysCount = 0;
        const fFields = {};
        if(generatePrimaryKey){
            for(let i in fields){
                const field = fields[i];
                if(!isObj(field)) continue;
                fFields[i] = field;
                if(field.primary == true && field.type ==DataTypes.STRING.type){
                    primaryKeysCount++;
                    primaryKey = i;
                }
            }
            fields = fFields;
        }
        const hasOnePrimaryKey = primaryKeysCount ===1;
        for(let i in fields){
            const field = fields[i];
            if(!isObj(field)) continue;
            let value = data[i];
            if(field.updateDate === true){
                value = new Date().toSQLDateTime();
            }
            if((field.updateBy === true) || (!value && field.createBy === true)){
                if(loginId && (typeof field.length != 'number' || (typeof field.length =='number' && loginId.length <= field.length))){
                    value = loginId;
                }
            }    
            if(typeof filter =='function' && filter({field,fields:fields,index:i,columnField:i,name:field.name,columnDef:field,value:data[i]}) == false) {
                continue;
            }
            const getErrorMessage = (e)=>{
                if(isObj(e)){
                    const message = defaultStr(e.message,e.msg);
                    if(message){
                        errorsMessages.push("{0} => {1}".sprintf(defaultStr(field.title,field.label),message))
                    }
                }
            }
            if(hasOnePrimaryKey){
                if(i === primaryKey && !isNonNullString(value)){
                    //const length = typeof field.length =='number'? field.length : typeof field.maxLength =='number'? field.maxLength : 0;
                    //on a trouvé plusieurs champs ayan la clé primaire
                    //on génère la valeur du champ primaryKey de type chaine de caractère
                    promises.push(new Promise((resolve,reject)=>{
                        return this.generatePrimaryKey({
                            primaryKey,
                            primaryKeyPrefix : defaultStr(piece,options.primaryKeyPrefix,field.primaryKeyPrefix),
                            userPiece : userPiece ? "/{0}-".sprintf(userPiece) : "",
                            data,
                            pieces,
                            piece,
                            session,
                            loginId,
                            userPiece,
                            fields,
                        }).then((val)=>{
                            result[primaryKey] = val;
                            resolve({[primaryKey]:val});
                        }).catch((e)=>{
                            getErrorMessage(e);
                            reject(e);
                        });
                    }));
                }
            }
            if((!(i in data)) && !value) {
                continue;
            }
            promises.push(this.validateField({pieces,piece,userPiece,result,field,columnDef:field,loginId,session,value,result,data,columnField:i}).catch((e)=>{
                getErrorMessage(e);
                throw e;
            }));
        }
        return new Promise((resolve,reject)=>{
            Promise.all(promises).then(()=>{
                const r = {data:result};
                this.emitEvent("validate",r,options);
                resolve(r);
                return r;
            }).catch((e)=>{
                console.log(e," error generated on validating model ",this.tableName);
                const message = "{0}:\n{1}".sprintf(errorsMessages.length > 1 ? ("Les erreurs suivantes ont été générées") : "l'erreur suivante a été générée",errorsMessages.join(", "));
                const r = {errors : errorsMessages,errorsMessages,message};
                this.emitEvent("novalidate",r,options);
                reject(r)
            })
        });
    }
    static async getPrimaryKeyPrefix({primaryKeyPrefix}){
        if(isNonNullString(primaryKeyPrefix)) return primaryKeyPrefix.trim();
        const tbld = defaultStr(this.tableName).toUpperCase().trim();
        if(tbld.length<=10) return tbld;
        return tbld.substring(0,10)
    }
    ///permet de construire la clé primaire en prenant en paramètre
    static async buildPrimaryKey({primaryKeyPrefix,userPiece,counterSuffix,counterIndex}){
        return primaryKeyPrefix+userPiece+counterSuffix;
    }
    /**** génère la clé primaire 
     * {
     *      primaryKey : {string} le nom du champ qui fait office de clé primaire
     *      primaryKeyPrefix {string} le prefix à ajouter au champ à générer
     *      userPiece {string} le prefix à ajouter au champ à générer
     * }
    */
    static async generatePrimaryKey(options){
        let {primaryKey,userPiece} = options;
        const pkPrefix  = await this.getPrimaryKeyPrefix(options);
        const primaryKeyPrefix = defaultStr(pkPrefix,options.primaryKeyPrefix);
        if(!isNonNullString(primaryKeyPrefix)|| !isNonNullString(primaryKey) || !isObj(this.fields[primaryKey]) || this.fields[primaryKey].primary !== true || this.fields[primaryKey].type !=DataTypes.STRING.type){
            return Promise.reject({error:true,message:'Impossible de générer une valeur pour la clé primaire liée à la table de données {0}. Veuillez spécifier à la fois le préfix à utiliser pour la génération des ids, champ primaryKeyPrefix. vous devez également Vous rassurer que le nom de la clé primaire figure dans les champs supportés par le model associé à la table de données. clé primaire spécifiée : [{1}], prefix : [{2}]'.sprintf(this.tableName,primaryKey,primaryKeyPrefix)})
        }
        return new Promise((resolve,reject)=>{
            let generatedValue = undefined,counterIndex = 0;
            const next = ()=>{
                if(isNonNullString(generatedValue)){
                    this.emitEvent("generate-primary-key",{primaryKey:generatedValue})
                    return resolve(generatedValue);
                }
                counterIndex++;
                const cPrefix = (counterIndex<10)? ("0"+counterIndex) : counterIndex;
                generatedValue = this.buildPrimaryKey({primaryKeyPrefix,userPiece:defaultStr(userPiece),counterSuffix:cPrefix,counterIndex});
                const cb = (d)=>{
                    if(!isObj(d)){
                        return resolve(generatedValue);
                    }
                    return next();
                }
                this.findOne({
                    where : {[primaryKey] : generatedValue}
                }).then(cb).catch(e=>{
                    if(isObj(e) && e.status === NOT_FOUND){
                        return resolve(generatedValue);
                    }
                    reject(e);
                });
            }
            this.count().then((count)=>{
                counterIndex= count;
                next();
            })
        })
    }
    static validateField ({field,columnField,value,result}){
        result = typeof result =="object" && result ? result : {};
        let error = false,message  = '';
        const fieldTitle = defaultStr(field.title,field.label);
        const valueStr = String(value);
        if(field.nullable === false && value == null && !isNonNullString(value) && !isNumber(value) && !isBool(value)){
            error = true;
            message = "Le champ [{0}] est requis".sprintf(fieldTitle);
        } else if(typeof field.length =='number' && field.length && valueStr.length > field.length){
            error = true;
            message = "Le champ [{0}] doit avoir une longueur de {1} caractères maxmimum".sprintf(fieldTitle,field.length);
        } else if(typeof field.minLength =='number' && field.minLength && valueStr.length < field.minLength){
            error = true;
            message = "Le champ [{0}] doit avoir au moins {1} caractères".sprintf(fieldTitle,field.length);
        } else if(typeof field.maxLength =='number' && field.maxLength && valueStr.length > field.maxLength){
            error = true;
            message = "Le champ [{0}] doit avoir au maximum {1} caractères".sprintf(fieldTitle,field.length);
        }
        if(error == true){
            return Promise.reject({message,error:true});
        }
        if(field.validType || field.validRule){
            return new Promise((resolve,reject)=>{
                const context = {};
                Validator.validate({...field,context,value});
                context.on("validatorNoValid",(args)=>{
                    context.offAll && context.offAll();
                    reject(args);
                });
                context.on("validatorValid",({value})=>{
                    result[columnField] = value;
                    context.offAll && context.offAll();
                    resolve({[columnField]:value});
                })
            });
        } else {
            result[columnField] = value;
            return Promise.resolve({[columnField]:value});
        }
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
     *      @param {queryBuilderMutator|mutateQueryBuilder: {function}, la fonction permettant de faire une mutation du query builder obtenue via la fonction buidQquery}
     * @param {bool|object} withStatementParams
     * @param {object} fields
     */
    static buildQuery(options,withStatementParams,fields){
        return new Promise((resolve,reject)=>{
            this.createQueryBuilder().then((builder)=>{
                const {queryBuilderMutator,mutateQueryBuilder,...queryOptions} = defaultObj(options);
                const sort = isObj(queryOptions.sort) ? queryOptions.sort : queryOptions.orderBy;
                fields = this.getFields(fields);
                const where = this.buildWhere(queryOptions.where,withStatementParams,fields,queryOptions);
                if(where){
                    builder.where(where);
                }
                if(queryOptions.limit){
                    try {
                        const limit = typeof queryOptions.limit =='number'? queryOptions.limit : parseInt(queryOptions.limit);
                        if(limit && limit >= 1){
                            builder.limit(Math.floor(limit));
                            const offset = defaultVal(queryOptions.offset,queryOptions.page);
                            if(offset){
                                const off = typeof offset =='number'? offset : parseInt(offset);
                                if(off && off >= 0){
                                    builder.offset(Math.floor(off));
                                }
                            }
                        }
                    } catch{}
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
                const mtator = typeof queryBuilderMutator =='function'? queryBuilderMutator : typeof mutateQueryBuilder =='function'? mutateQueryBuilder : undefined;
                const m = mtator && mtator(builder,queryOptions);
                if(isPromise(m)){
                    return m.then((e)=>{
                        resolve(builder);
                    }).catch(reject)
                } else {
                    resolve(builder);
                }
            }).catch(reject)
        })
    }
    ///permet de muter le query builder lors de la requête
    static mutateQueryBuilder(builder){
        return builder;
    }
    /*** effectue une requête query avec les paramètres issues de la requête query du queryBuidler
     * retourne plusieurs données résultat
     *  withTotal, si l'on retournera le résutat avec le total
     */
    static queryMany ({withStatementParams,fields,...queryOptions}){
        return new Promise((resolve,reject)=>{
            const withTotal = queryOptions.withTotal;
            if(withTotal){
                return Promise.all([
                    new Promise((succcess,error)=>{
                        this.buildQuery(queryOptions,withStatementParams,fields).then((builder)=>{
                            builder.getMany().then(succcess).catch(error);
                        }).catch(error);
                    }),
                    new Promise((succcess,error)=>{
                        this.buildQuery({...queryOptions,limit:undefined,page:undefined,offset:undefined},withStatementParams,fields).then((builder)=>{
                            builder.getCount().then((total)=>{
                                succcess(total);
                            }).catch(error);
                        }).catch(error);
                    })
                ]).then(([data,total])=>{
                    resolve({data,total,count:total});
                }).catch(reject);
            }
            return this.buildQuery(queryOptions,withStatementParams,fields).then((builder)=>{
                this.mutateQueryBuilder(builder,{...queryOptions,queryMany:true,fields})
                builder.getMany().then(resolve).catch(reject);
            }).catch(reject);
        })
    }
    /**** cherche les entities qui match les options findOptions
     * @see : https://typeorm.io/repository-api
     */
    static find (findOptions){
        return new Promise((resolve,reject)=>{
            this.getRepository().then((r)=>{
                return r.find(findOptions).then(resolve);
            }).catch(reject);
        })
    }
    static findMany (findOptions){
        return this.find(findOptions);
    }
    /**** cherche une entitie qui match les options findOptions
     * @see : https://typeorm.io/repository-api
     */
    static findOne (findOptions){
        return new Promise((resolve,reject)=>{
            this.getRepository().then((r)=>{
                return r.findOne(findOptions).then((data)=>{
                    if(data == null){
                        return reject(notFound);
                    }
                    resolve(data);
                });
            }).catch(reject);
        })
    }
    
    /*** @see : https://orkhan.gitbook.io/typeorm/docs/find-options */
    static findBy (findOptions){
        return new Promise((resolve,reject)=>{
            return this.getRepository().then((r)=>{
                return r.findBy(findOptions).then(resolve);
            }).catch(reject);
        })
    }
    static queryOne (queryOptions,withStatementParams,fields){
        queryOptions = defaultObj(queryOptions);
        queryOptions.withTotal = false;
        return new Promise((resolve,reject)=>{
            this.buildQuery(queryOptions,withStatementParams,fields).then((builder)=>{
                builder.getOne().then((data)=>{
                    if(data === null){
                        return reject(notFound);
                    }
                    resolve(data);
                }).catch(reject);
            }).catch(reject);
        })
    }
    static getRawOne(queryOptions){
        queryOptions = defaultObj(queryOptions);
        queryOptions.withTotal = false;
        return new Promise((resolve,reject)=>{
            this.buildQuery(queryOptions).then((builder)=>{
                builder.getRawOne().then((data)=>{
                    if(data === null){
                        return reject(notFound);
                    }
                    resolve(data);
                }).catch(reject);
            }).catch(reject);
        })
    }
    static count (FindOptions){
        return new Promise((resolve,reject)=>{
            this.getRepository().then((r)=>{
                return r.count(FindOptions).then(resolve);
            }).catch(reject);
        })
    }
    static save (...args){
        return new Promise((resolve,reject)=>{
            return this.getRepository().then((r)=>{
                return r.save(...args).then(a=>{
                    this.emitEvent("save",{data:a,result:a},...args);
                    this.emitChangeEvent("save",{data:a,result:a},...args);
                    resolve(a);
                });
            }).catch(reject);
        })
    }
    static update (...args){
        return new Promise((resolve,reject)=>{
            return this.getRepository().then((r)=>{
                return r.update(...args).then((a)=>{
                    this.emitEvent("update",{data:a,result:a},...args);
                    this.emitChangeEvent("update",{data:a,result:a},...args);
                    return resolve(a);
                });
            }).catch(reject);
        })
    }
    static upsert (...args){
        return new Promise((resolve,reject)=>{
            return this.getRepository().then((r)=>{
                return r.upsert(...args).then((a)=>{
                    this.emitEvent("upsert",{data:a,result:a},...args);
                    this.emitChangeEvent("upsert",{data:a,result:a},...args);
                    return resolve(a);
                });
            }).catch(reject);
        })
    }
    /****supprime à partir des données issue de la requête fournie par un queryBuilder */
    static queryDelete(queryOptions){
        queryOptions = defaultObj(queryOptions);
        queryOptions.withTotal = false;
        return new Promise((resolve,reject)=>{
            this.buildQuery(queryOptions).then((builder)=>{
                return builder.delete().from(this).then((a)=>{
                    this.emitEvent("delete",{data:a,result:a},queryOptions);
                    this.emitChangeEvent("delete",{data:a,result:a},queryOptions);
                    resolve(a);
                }).catch(reject);
            }).catch(reject);
        })
    }
    static remove (...args){
        return new Promise((resolve,reject)=>{
            this.getRepository().then((r)=>{
                return r.remove(...args).then(a=>{
                    this.emitEvent("delete",{data:a,result:a,deleted:a},...args);
                    this.emitChangeEvent("delete",{data:a,result:a,deleted:a},...args);
                    resolve(a);
                });
            }).catch(reject);
        });
    }
    static removeMany(findOptions){
        return this.findMany(findOptions).then((allData)=>{
            return this._checkBeforeRemoveAndRemove({...defaultObj(findOptions),allData,data:allData});
        })
    }
    static removeOne(findOptions){
        return this.findOne(findOptions).then((data)=>{
            return this._checkBeforeRemoveAndRemove({...defaultObj(findOptions),data,allData:data});
        })
    }
    static queryRemove(queryOptions,...rest){
        queryOptions = defaultObj(queryOptions);
        queryOptions.withTotal = false;
        return this.queryMany(queryOptions,...rest).then((allData)=>{
            return this._checkBeforeRemoveAndRemove({...queryOptions,allData,data:allData})
        });
    }
    /**** la fonction check and before remove exécute la fonctioon beforeRemove, lorsqu'elle existe sur les données allData.
     *  si cette fonction retourne un string, alors il s'agit du message généré lors de l'éxécution de la requête
     *  si cette fonction retourne un array, alors le tableau en question est utilisé pour la suppression des données
     *  si cette fonction retourne un objet et si l'objet porte le contenu message où msg et la valeur errort à true, alors il s'agit d'une exception générée
     *  si cette fonction n'est pas définie, alors toutes les données allData sont supprimés via la fonction remove du model
     */
        static _checkBeforeRemoveAndRemove(args){
            args = defaultObj(args);
            const {allData,beforeRemove} = args;
            const b = typeof beforeRemove =='function'?beforeRemove(args) : null;
            return new Promise((resolve,reject)=>{
                if(isNonNullString(b)){
                    return reject({message:b,status:FORBIDEN})
                }
                if(isObj(b) && b.error === true && (isNonNullString(b.message) || isNonNullString(b.message))){
                    return reject(b);
                }
                return isPromise(b)? b.then((data)=>{
                    const toRemove = Array.isArray(data)?data:allData;
                    return this.remove(toRemove).then(a=>{
                        const r = {...args,data,allData:data};
                        this.emitEvent("delete",{data:a,result:a,deleted:toRemove},r);
                        this.emitChangeEvent("delete",{data:a,result:a,deleted:toRemove},r);
                        resolve(a);
                    }).catch(reject);
                }) : this.remove(allData).then(resolve).catch(reject);
            })
        }
}
