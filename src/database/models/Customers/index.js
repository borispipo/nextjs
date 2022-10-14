import BaseModel from "../Base";
import {defaultObj,isNonNullString,isObj} from "$utils";
import {comparePassword } from "$models/utils";
import {NOT_FOUND,UNAUTHORIZED} from "$api";
import Entity from "./entity";


export default class CustomersModel extends BaseModel {
    static fields = Entity.fields;
    static tableName = Entity.tableName;
    static name = Entity.name;
    static Entity = Entity;
};

/**** récupère le client dont les paramtères sont passée dans l'options options
 * @param {string} code, le code du client
 * @param {string} password sont mot de pass
 * @param {boolean} checkPassword : si le mot de passe doit être vérifié
 */
export const getCustomer = CustomersModel.getCustomer = async (options)=>{
    options = defaultObj(options);
    const {code,password,checkPassword,findOptions,where} = options;
    if(!isNonNullString(code)){
        throw {message:'Veuillez spécifier un code tiers valide',status:UNAUTHORIZED};
    }
    if(checkPassword === true && !isNonNullString(password)){
        throw ({status:UNAUTHORIZED,message:"Vous devez spécifier un mot de pass valide"});
    }
    await CustomersModel.init();
    const data = await CustomersModel.repository.findOne({
        where : {
            code : code.toUpperCase().trim()
        }
    });
    if(isObj(data)){
        if(checkPassword === true && !comparePassword (password,data.password)){
            throw ({status:UNAUTHORIZED,message:'Mot de pass client incorrect'});
        }
        delete data.password;
        delete data.pass;
        return data;
    }
    throw ({status:NOT_FOUND,message:"Le client <<{0}>> n'existe pas!!Merci de spécifier un code client valide".sprintf(code)});
}