/***@see : https://nextjs.org/docs/advanced-features/middleware 
 * For upgrade guide, @see : https://nextjs.org/docs/messages/middleware-upgrade-guide
*/
import { NextResponse } from 'next/server'
import { middleWares } from '$middlewares';
import { getUserSession } from '$nauth/utils/auth-cookies';
import "$cutils/extend.prototypes";
import {getAPIHost,getBaseHost} from "$capi/host/utils";

const isObj = x=> x && typeof x=='object' && !Array.isArray(x);

export default async function middleware(req,event) {
  const path = req.nextUrl.pathname;
  const isAdmin = path.startsWith('/admin/');
  const isProtected = path.contains("/protected/");
  if(isAdmin || isProtected){
    const redirectingPath = (isApiRoute(req)? (getAPIHost().rtrim("/")+('/auth/you-are-not-signed-in')):(getBaseHost().rtrim("/")+"/"+"auth/signin")).rtrim("/");
    try {
      const session = await getUserSession(req);
      if(!isObj(session)){
        return redirectToPage(req,redirectingPath)
      } 
    } catch (error) {
      console.error(error," checking middleware error");
      return redirectToPage(req,redirectingPath+"?error=1&status=500&message="+error?.message)
    }
  }
  for await (const middle of middleWares) {
      if(typeof middle =='function'){
        const res = await middle(req, event);
        if (res) return res
      }
  }
  return NextResponse.next();
};

const isApiRoute = (req)=> req.nextUrl.pathname.startsWith("/api/");

const redirectToPage = (req,path)=>{
  req.nextUrl.searchParams.set('from', req.nextUrl.pathname);
  req.nextUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
  req.nextUrl.pathname = path;
  return NextResponse.redirect(req.nextUrl)
}