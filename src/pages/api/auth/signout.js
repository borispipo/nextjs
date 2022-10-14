import { removeTokenCookie } from '$nauth';
import { SUCCESS } from '$api/status';

export default async function logout(req, res) {
  removeTokenCookie(res)
  res.status(SUCCESS).json({message:'Vous vous êtes déconnecté avec succès!!'})
  //res.writeHead(SUCCESS, { Location: '/' })
  //res.end()
}