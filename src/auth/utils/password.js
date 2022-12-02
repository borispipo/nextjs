// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {UNAUTHORIZED} from "$api";
import isNonNullString from "$cutils/isNonNullString";
const bcrypt = require('bcrypt');

export const saltRounds = 10;

/**** crypter le mot de passe passé en paramètre 
 * @see : https://github.com/kelektiv/node.bcrypt.js
 * @param {string} password le mot de passe à crypter
 * @param {string|number} salt
*/
export const encryptPassword = (password,salt) => {
    if(!isNonNullString(password)) {
        return Promise.reject({status:UNAUTHORIZED,message:'Vous devez spécifier un mot de pass non null'});
    }
    if(isNonNullString(salt)){
        return new Promise((resolve,reject)=>{
            return bcrypt.genSalt(saltRounds).then((salt2)=>{
                return bcrypt.hash(password, salt2).then(resolve);
            }).catch(reject);  
        })
    }
    return bcrypt.hash(password, salt && typeof salt =='number'? salt : saltRounds);
};
/**
 * compare le mot de passe utilisateur passé en paramètre
 *  @param {string} password le mot de passe bruite passé en paramètre
  * @param {string} hash le mot de passe crypté enregistré en base de données
  * @return {Promise<true>}
 */
 export const comparePassword = (password, hash) => {
    if(!isNonNullString(password)){
        return Promise.reject({status:UNAUTHORIZED,message : 'Vous devez spécifier un mot de pass non null'});
    }
    if(!isNonNullString(hash)){
        return Promise.reject({status:UNAUTHORIZED,message : 'Vous devez spécifier un mot de pass de comparaison non null'});
    }
    return new Promise((resolve,reject)=>{
        const rError = {message:'Mot de pass incorrect',status:UNAUTHORIZED};
        bcrypt.compare(password, hash).then((isMatch)=>{
            if(!isMatch){
                reject(rError)
            } else {
                resolve(true);
            }
        }).catch((e)=>{
            reject({error:e,...rError})
        });
    })
};

export const verifyPassword = comparePassword;