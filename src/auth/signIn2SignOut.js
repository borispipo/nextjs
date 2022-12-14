// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {isObj} from "$utils";
import { getProvider } from "./providers";

export const isMasterAdmin = (user)=>{
    if(!isObj(user)) return false;
    const provider = getProvider(user.providerId);
    if(!isObj(provider)) return false;
    if(typeof provider.isMasterAdmin =="function") return provider.isMasterAdmin(user);
    return user.isMasterAdmin ? true : false;
}
export default {
    /**** l'utilisateur connecté avec le compte client est le super user de l'application */
    isMasterAdmin,
}