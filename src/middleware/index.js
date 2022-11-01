// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

/***@see : https://nextjs.org/docs/advanced-features/middleware 
 * For upgrade guide, @see : https://nextjs.org/docs/messages/middleware-upgrade-guide
*/
/**@module $nmiddleware, wrapperpour middleware nextJS */
import { NextResponse } from 'next/server'
import middleWares from '$middlewares';
import {checkRedirect} from "./utils";
import cors from "$cors";

/****@function  */
export default async function middleware(req,event) {
  const method = req.method && req.method.toUpperCase && req.method.toUpperCase();
  if(method === 'OPTIONS'){
      const response = NextResponse.next()
      console.log("returning heeeeeeeeeeeeeeeeeeee",req)
      //await cors(req,response);
      //return response;
  }
  const r = await checkRedirect(req);
  if(r !== false){
     return r;
  }
  return NextResponse.next();
  if(typeof middleWares=='object' && middleWares){
    for await (const middle of middleWares) {
        if(typeof middle =='function'){
          const res = await middle(req, event);
          if (res) return res
        }
    }
  }
  return NextResponse.next();
};

