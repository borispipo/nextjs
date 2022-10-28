// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {setSessionOnRequest} from "./auth-cookies";
import providers from "../providers";

/***** permet de se rassurer que l'utilisateur encours est connecté via le provider passé en paramètre
 * @param {object|string|func} provider - l'objet provider que l'on désire utiliser pour se rassurer que l'utilisateur soit connecté, s'il s'agit d'une chaine de caractère, alors la chaine en question sera considéré comme le nom du provider
 *        - si provider est une fonction alors la variable est subsitué avec la variable handler
 * @param {function|object|string} - la fonction handler à utiliser au cas où l'utilisateur est connecté via la session
 * si provider et handler sont les fonctions alors la fonction handler sera executée lorsque la boucle l'appel de la fonction provider sur les différents providers aura retourné true
 * @param {string} errorMessage - le message d'erreur l'orsque l'on n'est pas connecté avec ledit provider
 */
 export function withProviderSession (provider,handler,errorMessage){
    let filter = null,providerId = "";
    if(typeof provider =='string'){
       providerId = provider; 
    } else if(typeof provider =='object' && provider){
      providerId = provider.providerId || provider.id;
    } else if(typeof provider =='function'){
       const t = handler;
       if(typeof handler =='function'){
         filter = (session)=> {
             for(let i in providers){
               const prov = providers[i];
               if(prov && typeof prov =='object' && prov.id && typeof prov.id =='string'){
                  if(provider(session,prov)){
                     return true;
                  }
               }
             }
             return false;
         }
       } else {
          handler = provider;
          provider = t;
          providerId = typeof provider =='string'? provider : provider && typeof provider =='object'? (provider.providerId || provider.id) : null;
       }
    }
    if(providerId && typeof providerId =='string'){
       filter = (session) => session.providerId?.toLowerCase() == providerId.toLowerCase()? true : false; 
    }
    return async function handlerWithProviderSession(req, res,a1,a2) {
      const session = await setSessionOnRequest(req,res);
      if(!session || typeof session!='object' || (filter && !filter(session))){
          errorMessage = errorMessage && typeof errorMessage =='string'? errorMessage : ('Vous devez vous connecter avec le gestionnaire d\'authentification '+(providerId||''));
          return res.status(UNAUTHORIZED).json({message:errorMessage});
      }
      return handler(req, res,a1,a2);
    };
  }