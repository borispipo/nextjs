// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import cors from 'edge-cors'
import {SUCCESS} from "$api/status";
const requestHeaders = require("../../request.headers");

export default async function CorsMiddleware(req){
    const options = {};
    for(let i in requestHeaders){
        if(typeof requestHeaders[i] =='object' && requestHeaders[i] && 'value' in requestHeaders[i]){
            options[i] = requestHeaders[i].value;
        }
    }
    return await cors(
        req,
         new Response(JSON.stringify({ message: 'can make api request' }), {
            status: SUCCESS,
            headers: {...req.headers},
         }),
         options
    );
}