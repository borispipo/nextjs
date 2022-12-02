// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {NOT_FOUND,UNAUTHORIZED} from "$api";
import isNonNullString from "$cutils/isNonNullString";
import { randomBytes, scryptSync } from 'crypto';

const bcrypt = require('bcrypt');
//@see : https://stackoverflow.com/questions/19822643/what-is-an-alternative-for-bcrypt-to-use-with-node

/**** crypter le mot de passe passé en paramètre 
 * @param {string} password le mot de passe à crypter
 * @param {function} callback la fonction de rappel à utiliser lorsque le mot de passe est crypté
*/
// Pass the password string and get hashed password back
// ( and store only the hashed string in your database)
export const encryptPassword = (password,salt) => {
    if(!isNonNullString(password)) {
        throw {status:UNAUTHORIZED,message:'Vous devez spécifier un mot de pass non null'};
    }
    if(!isNonNullString(salt)){
        salt = randomBytes(16).toString('hex');
    }
    return scryptSync(password, salt, 32).toString('hex');
};
/**
 * Hash password with random salt
 * @return {string} password hash followed by salt
 *  XXXX till 64 XXXX till 32
 *  
 */
 export const hashPassword = (password) => {
    // Any random string here (ideally should be at least 16 bytes)
    const salt = randomBytes(16).toString('hex');
    return encryptPassword(password, salt) + salt;
};

/**
 * compare le mot de passe utilisateur passé en paramètre
 *  @param {string} password le mot de passe bruite passé en paramètre
  * @param {string} hash le mot de passe crypté enregistré en base de données
 */
 export const comparePassword = (password, hash) => {
    if(!isNonNullString(password)){
        throw ({status:UNAUTHORIZED,message : 'Vous devez spécifier un mot de pass non null'});
    }
    if(!isNonNullString(hash)){
        throw ({status:UNAUTHORIZED,message : 'Vous devez spécifier un mot de pass de comparaison non null'});
    }
    // extract salt from the hashed string
    // our hex password length is 32*2 = 64
    const salt = hash.slice(64);
    const originalPassHash = hash.slice(0, 64);
    const currentPassHash = encryptPassword(password, salt);
    return originalPassHash === currentPassHash;
};
