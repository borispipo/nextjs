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
        const header = header;
        if(!(i in options) && typeof header =='object' && header && 'value' in header){
            if("corsValue" in header){
                options[i] = header.corsValue;
            } else {
                options[i] = header.value;
            }
        }
    }
    console.log(options," is options heeeeeeee");
    return new Promise((resolve,reject)=>{
        cors(options)(req, res, (result) => {
            if (result instanceof Error) {
              return reject(result)
            }
            return resolve(result)
        })
    });
}