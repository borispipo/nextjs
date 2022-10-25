// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import cors from 'edge-cors'
import {SUCCESS} from "$api/status";

export default async function CorsMiddleware(req){
    return await cors(
        req,
         new Response(JSON.stringify({ message: 'can make api request' }), {
            status: SUCCESS,
            headers: {'Content-Type': 'application/json' ,...req.headers},
         })
    );
}