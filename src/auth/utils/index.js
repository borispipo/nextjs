import isNonNullString from "$cutils/isNonNullString";
export * from "$cauth/utils";

export * from "./auth-cookies";

export * from "./withProviderSession";

const bcrypt = require('bcrypt');

/**** crypter le mot de passe passé en paramètre 
 * @param {string} password le mot de passe à crypter
 * @param {function} callback la fonction de rappel à utiliser lorsque le mot de passe est crypté
*/
export const encryptPassword = function(password, callback) {
    if(!isNonNullString(password)) return Promise.reject({status:false,message:'Vous devez spécifier un mot de pass non null'});
    return new Promise((resolve,reject)=>{
        bcrypt.genSalt(10, function(err, salt) {
            if (err) {
                if(typeof callback =='function'){
                    callback(err);
                }
                return reject(err);
            }
            bcrypt.hash(password, salt, function(err, hash) {
                if(typeof callback =='function'){
                    callback(err, hash)
                }
                if(err){
                    return reject(err);
                }
                return resolve(hash);
            });
        });
    })
 };
 /**** compare le mot de passe utilisateur passé en paramètre
  * @param {string} plainPass le mot de passe bruite passé en paramètre
  * @param {string} hashword le mot de passe crypté enregistré en base de données
  * @param {function} callback la fonction de rappel 
  */
 export const comparePassword = function(plainPass, hashword, callback) {
    return new Promise((resolve,reject)=>{
        if(!isNonNullString(plainPass)){
            return Promise.reject({status:false,message : 'Vous devez spécifier un mot de pass non null'});
        }
        bcrypt.compare(plainPass, hashword, function(err, isPasswordMatch) {   
            if(typeof callback =='function'){
                callback(err, err ? false : isPasswordMatch);
            }
            if(err){
                return reject(err);
            }
            resolve(isPasswordMatch);
        });
    })
 };