import { removeTokenCookie } from '$nauth';
import { SUCCESS } from '$capi/status';

/****
 * @api {get} /auth/logout Déconnecte l'utilisateur conecté
 * @apiName {Logout User}
 * @apiGroup auth
 * 
 */
export default async function logout(req, res) {
  removeTokenCookie(res)
  res.status(SUCCESS).json({message:'Vous vous êtes déconnecté avec succès!!'})
  //res.writeHead(SUCCESS, { Location: '/' })
  //res.end()
}