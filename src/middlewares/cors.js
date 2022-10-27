// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import cors from 'edge-cors'
import {SUCCESS} from "$api/status";
const requestHeaders = require("../../request.headers");

export default function CorsMiddleware(req,res,options){
    options = typeof options =='object' && options && !Array.isArray(options)? options : {};
    res = (res && res instanceof Response)? res : 
    new Response(JSON.stringify({ message: 'can make api request' }), {
       status: SUCCESS,
       headers: {...req.headers},
    })
    for(let i in requestHeaders){
        if(!(i in options) && typeof requestHeaders[i] =='object' && requestHeaders[i] && 'value' in requestHeaders[i]){
            options[i] = requestHeaders[i].value;
        }
    }
    return cors(
        req,
        res,
        options
    );
}