// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {UNAUTHORIZED} from "$api";
import isNonNullString from "$cutils/isNonNullString";
import * as crypto from "crypto";
import * as argon2 from "argon2";

const hashingConfig = { // based on OWASP cheat sheet recommendations (as of March, 2022)
    parallelism: 1,
    memoryCost: 64000, // 64 mb
    timeCost: 3 // number of itetations
}

/**** crypter le mot de passe passé en paramètre 
 * @param {string} password le mot de passe à crypter
 * @param {string} salt
 * @param {object} les options de configuration argon2 à utiliser pour haschage
*/
// Pass the password string and get hashed password back
// ( and store only the hashed string in your database)
export const encryptPassword = (password,salt,hashingConfiguration) => {
    if(!isNonNullString(password)) {
        return Promise.reject({status:UNAUTHORIZED,message:'Vous devez spécifier un mot de pass non null'});
    }
    if(!isNonNullString(salt)){
        salt = crypto.randomBytes(16);
    }
    return argon2.hash(password, {
        ...hashingConfig,
        ...Object.assign({},hashingConfiguration),
        salt,
    });
};
/**
 * compare le mot de passe utilisateur passé en paramètre
 *  @param {string} password le mot de passe bruite passé en paramètre
  * @param {string} hash le mot de passe crypté enregistré en base de données
  * @return {Promise<true>}
 */
 export const comparePassword = (password, hash,hashingConfiguration) => {
    if(!isNonNullString(password)){
        return Promise.reject({status:UNAUTHORIZED,message : 'Vous devez spécifier un mot de pass non null'});
    }
    if(!isNonNullString(hash)){
        return Promise.reject({status:UNAUTHORIZED,message : 'Vous devez spécifier un mot de pass de comparaison non null'});
    }
    return new Promise((resolve,reject)=>{
        argon2.verify(hash, password, {...hashingConfig,...Object.assign({},hashingConfiguration)}).then(resolve).catch((e)=>{
            reject({error:e,message:'Mot de pass incorrect',status:UNAUTHORIZED})
        });
    })
};

export const verifyPassword = comparePassword;