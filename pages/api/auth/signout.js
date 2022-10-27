import { removeTokenCookie } from '$nauth';
import { SUCCESS } from '$capi/status';
import withCors from "$withCors";
/****
 * @api {get} /auth/logout Déconnecter un utilisateur
 * @apiName {Logout User}
 * @apiGroup auth
  * @apiVersion 1.0.0
 * 
 */
export default withCors(async function logout(req, res) {
  removeTokenCookie(res)
  res.status(SUCCESS).json({message:'Vous vous êtes déconnecté avec succès!!'})
  //res.writeHead(SUCCESS, { Location: '/' })
  //res.end()
});