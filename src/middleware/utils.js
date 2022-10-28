// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { getProviderSession } from '$nauth/utils/auth-cookies';
import {getAPIHost,getBaseHost} from "$capi/host/utils";
import { NextResponse } from 'next/server'
import "$cutils/extend.prototypes";

const isObj = x=> x && typeof x=='object' && !Array.isArray(x);

export const isApiRoute = (req)=> req.nextUrl.pathname.startsWith("/api/");

export const redirectToPage = (req,path)=>{
  const prevPath = req.nextUrl.pathname;
  req.nextUrl.searchParams.set('from', prevPath);
  req.nextUrl.searchParams.set('callbackUrl', prevPath)
  req.nextUrl.pathname = path;
  //return NextResponse.rewrite(new URL(prevPath, path));
  return NextResponse.redirect(req.nextUrl)
}

/*** utililitaire middleware permettant de spécifier si l'utilisateur sera rédirigé où pas
 * @param {NextRequest} req l'objet NextRequest
 * @param {boolean} redirect si la fonction procédera à la redirection de l'utilisateur où non. si redirect est à false, alors 
 * l'url de redirection sera retournée au lieu de rediriger l'utilisateur
 */
export const checkRedirect = async (req,redirect)=>{
  const path = req.nextUrl.pathname;
  const isAdmin = path.startsWith('/admin/');
  const isProtected = path.contains("/protected/");
  if(isAdmin || isProtected){
    const redirectingPath = (isApiRoute(req)? (getAPIHost().rtrim("/")+('/auth/you-are-not-signed-in')):(getBaseHost().rtrim("/")+"/"+"auth/signin")).rtrim("/");
    try {
      const session = await getProviderSession(req);
      if(!isObj(session)){
        if(redirect === false){
            return redirectingPath;
        }
        return redirectToPage(req,redirectingPath)
      } 
    } catch (error) {
      console.error(error," checking middleware error");
      if(redirect === false){
          return redirectingPath;
      }
      return redirectToPage(req,redirectingPath+"?error=1&status=500&message="+error?.message)
    }
  }
  return false;
}