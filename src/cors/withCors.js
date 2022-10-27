// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import cors from "./index";
export default async function withCors (hanlder){
    return async (req,res,options,a)=>{
        const next  = typeof options =='function'?options : typeof a =='function'? a : undefined;
        options = typeof options =='object' && options  && !Array.isArray(options)? options : typeof a =='object' && a && !Array.isArray(a)? a : {};
        await cors(req,res,options);
        return await hanlder(req,res,next);
    }
}