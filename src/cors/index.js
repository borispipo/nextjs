// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import cors from 'cors'
const requestHeaders = require("../../request.headers");

export default function CorsMiddleware(req,res,options){
    options = typeof options =='object' && options && !Array.isArray(options)? options : {};
    if(!res || typeof res =='boolean' || !res.setHeader) {
        return Promise.resolve({});
    }
    for(let i in requestHeaders){
        if(!(i in options) && typeof requestHeaders[i] =='object' && requestHeaders[i] && 'value' in requestHeaders[i]){
            options[i] = requestHeaders[i].value;
        }
    }
    return new Promise((resolve,reject)=>{
        cors(options)(req, res, (result) => {
            if (result instanceof Error) {
              return reject(result)
            }
            return resolve(result)
        })
    });
}