// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

/***
 * @module $nauth/auth-cookies : fonctions utiles pour la manipulation des cookies nextjs
 */
import { serialize, parse } from 'cookie'
import defaultStr from "$utils/defaultStr";
import * as jose from 'jose';
import {UNAUTHORIZED } from "$api/status";

const TOKEN_NAME = 'token'

export const MAX_AGE = 3* 60 * 60 * 24 // 3 days

/**** Sauvegarde/persiste un token dans l'objet res{NextResponse} 
 * @module $nauth/auth
 * @param {object} res, l'object NextResponse
 * @param {string} token, le token à persister
 * @return {object} l'objet serialisé
*/
export function setTokenCookie(res, token) {
  const cookie = serialize(TOKEN_NAME, token, {
    maxAge: MAX_AGE,
    expires: new Date(Date.now() + MAX_AGE * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  })
  res.setHeader('Set-Cookie', cookie);
  return cookie;
}

/**** */

export function removeTokenCookie(res) {
  const cookie = serialize(TOKEN_NAME, '', {
    maxAge: -1,
    path: '/',
  })
  res.setHeader('Set-Cookie', cookie)
}

export function parseCookies(req) {
  // For API Routes we don't need to parse the cookies.
  if (req.cookies) return req.cookies
  // For pages we do need to parse the cookies.
  const cookie = req.headers?.cookie
  return parse(cookie || '')
}

export function getTokenCookie(req) {
  const cookies = parseCookies(req);
  return cookies[TOKEN_NAME]
}

export const TOKEN_SECRET = defaultStr(process.env.AUTH_TOKEN_SECRET,"db2781bb2c83ede11d2326af16a539ee1bf74419b8e12e02083a4b8f492e64f5");

export async function createUserToken(res, session) {
  const createdAt = Date.now()
  // Create a session object with a max age that we can validate later
  const obj = { ...session, createdAt, maxAge: MAX_AGE }
  //const token =  jwt.sign(obj,TOKEN_SECRET, {expiresIn: "7 days"});
  const token = await new jose.SignJWT(obj)
                        .setProtectedHeader({ alg: 'HS256' })
                        .setIssuedAt()
                        .setExpirationTime('7d')
                        .sign(new TextEncoder().encode(TOKEN_SECRET));
  setTokenCookie(res, token);
  return token;
}
export const createToken = createUserToken;

export const getAuthorizationHeader = (req)=>{
  if(!req || !req.headers || typeof req.headers !=='object') return "";
  let authHeader = req.headers.authorization || req.headers.Authorization || '';
  if(!authHeader && 'forEach' in req.headers){
    req.headers.forEach((element,i) => {
       if(typeof i =='string' && i.toLowerCase() =='authorization'){
          authHeader = String(element);
       }
    });
  }
  return authHeader;
}
export async function getUserToken(req) {
  const authHeader = getAuthorizationHeader(req);
  if(authHeader.startsWith('bearer ') || authHeader.startsWith('Bearer ')){
    const token = authHeader.substring(7, authHeader.length);
    if(token) return token;
  }
  return await getTokenCookie(req);
}

///on peut directement passer le token en paramètre pour la vérification
export const getProviderSession = async (req,tokenString)=>{
  const token = typeof tokenString =='string' && tokenString || await getUserToken(req);
  delete req.session;
  if (!token) return null;
  try {
    const { payload: session } = await jose.jwtVerify(
        token, new TextEncoder().encode(TOKEN_SECRET)
    );
    if(session == null || !session || typeof session.createdAt !=='number' || typeof session.maxAge !== 'number') return null;
    const expiresAt = session.createdAt + session.maxAge * 1000
    // Validate the expiration date of the session
    if (Date.now() > expiresAt) {
      return null;
    }
    if(typeof req.session !=='object' || !req.session){
      req.session = session;
    }
    return session
  } catch (e){
      console.log(e," getting token");
  }
  return null;
}
export const getUserSession = getProviderSession;
export const getSession = getProviderSession;

export const setSessionOnRequest = async (req,res)=>{
  const session = await getProviderSession(req,res);
  if(typeof req.session !=='object' || !req.session){
      Object.defineProperties(req,{
        session : {
          value : session,
        },
        isCustomer : {
          value : session && typeof session =='object' && session.providerId =='customer'? true : false,
        },
        isProviderSession : {
          value : (provider)=>{
              const providerId = typeof provider =='string' ? provider.toLowerCase() : typeof provider =='object' && provider && typeof provider.id =='string' && provider.id ||'';
              return session && typeof session =='object' && session.providerId?.toLowerCase() === providerId ? true : false;
          }
        }
    });
  }
  return session;
}

/*** hoook utile pour le rendu des contenu avec les session utilisateur */
export function withSession(handler){
  return async function handlerWithSession(req, res,a1,a2) {
    await setSessionOnRequest(req,res);
    return handler(req, res,a1,a2);
  };
}

export function withCustomerSession (handler){
  return async function handlerWithCustomerSession(req, res,a1,a2) {
    const session = await setSessionOnRequest(req,res);
    if(!session || typeof session!='object' || !session.isCustomer){
        return res.status(UNAUTHORIZED).json({message:'Vous devez vous connecter avec un compte client afin de solliciter ce type de ressource'});
    }
    return handler(req, res,a1,a2);
  };
}

