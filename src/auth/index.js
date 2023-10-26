// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

/**
 * @module $next-js/auth- exporte toutes les fonctions utilles de @nextjs
 * @see @module $cauth
 */
import {isObj,extendObj} from "$utils";
import { getProvider } from "./providers";
import { signInRef } from "$cauth/authSignIn2SignOut";

export * from "./utils";

export {default as providers} from "./providers";

export * from "./providers";

export * from "$auth-utils";

export * from "./utils/password";

extendObj(signInRef.current,{
    isMasterAdmin : (user)=>{
        if(!isObj(user)) return false;
        const provider = getProvider(user.providerId);
        if(!isObj(provider)) return false;
        if(typeof provider.isMasterAdmin =="function") return provider.isMasterAdmin(user);
        return user.isMasterAdmin ? true : false;
    },
});