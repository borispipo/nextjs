// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import cors from "./index";
export default function withCors (hanlder){
    return async (req,res,event)=>{
        console.log(req.headers," is req heea")
        await cors(req,res);
        return await hanlder(req,res,event);
    }
}