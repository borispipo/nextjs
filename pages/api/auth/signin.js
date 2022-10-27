import {UNAUTHORIZED,NOT_ACCEPTABLE} from "$capi/status";
import { createRouter } from "$next-connect";
import {getProvider,createUserToken} from "$nauth";
import {isObj,defaultObj,isNonNullString} from "$cutils";
import cors from "$cors";
/** 
 * @apiDefine ProiverNotFound lorsque le provider n'a pas été précisé dans les données passé à la requête
 */
/** @apiDefine DataNotFound Données innexistante où mot de passe incorrecte  */
/**
  @api {post} /auth/signin Authentifier un utilisateur
  @apiName {SignIn}
  @apiGroup auth
  @apiBody {string} providerId l'id du provider à utiliser pour l'authentification de l'utilisateur
  @apiBody {Object} ...others les données supplémentaires à passer à la fonction authorize du provider pour authentifier l'utilisateur 
* @apiSuccess {boolean} done=true pour spécifier que l'opération s'est déroulée avec succès
* @apiSuccess {String} token  le jetton Bearer généré pour servir lors des prochaines connexions de l'utilisateur
 * @apiVersion 1.0.0
* @apiSuccessExample Success-Response:
*     HTTP/1.1 200 OK
*     {
*       "done": true,
*       "token": "eyJhbGciOiJIUzI1NiJ9.eyJjb2RlIjoiQ0NSQyIsImxhYmVsIjoiQ0NSQyBTQVJMIiwic3RhdHVzIjoxLCJlbWFpbCI6ImNjcmNAZ21haWwuY29tIiwicHJvdmlkZXIiOnsiaWQiOiJjdXN0b21lciIsIm5hbWUiOiJDdXN0b21lcnMifSwicHJvdmlkZXJJZCI6ImN1c3RvbWVyIiwiaXNDdXN0b21lciI6dHJ1ZSwiY3JlYXRlZEF0IjoxNjY1ODQ4Mzk1NTIwLCJtYXhBZ2UiOjI1OTIwMCwiaWF0IjoxNjY1ODQ4Mzk1LCJleHAiOjE2NjY0NTMxOTV9.Ea1Q4GbsUP1hQxh4PTCh8yY--eTvz-Txq_dClrx1HyA"
*     }
*/

export default createRouter().post(async (req, res) => {
    await cors(req,res);
    try {
      if(!isObj(req.body)){
         res.status(NOT_ACCEPTABLE).json({message:'Vous devez spécifier un nom d\'utilisateur et un mot de pass valide'});
         return;
      }
      const {providerId} = req.body;
      const provider = getProvider(providerId);
      if(!isObj(provider) || typeof provider.authorize !== 'function'){
          return res.status(NOT_ACCEPTABLE).json({message:'Vous devez spécifier un gestionnaire d\'authentification valide'});
      }
      const user = await provider.authorize({req,res,request:req,data:req.body,query:defaultObj(req.query)})
      if(isNonNullString(user)){
        return res.status(UNAUTHORIZED).send({message: user});
      }
      ///permet d'autentifier l'utilisateur en spéfiant la méthode en paramètre
      if(!isObj(user)){
         return res.status(UNAUTHORIZED).send({message:'Données innexistante où mot de pass incorrect'});
      }
      const p = {};
      Object.map(provider,(prov,i)=>{
        if(typeof prov !== 'function' && i !=='credentials' && i !='modelName' && i!='modelNames' && typeof prov !=='object'){
            p[i] = prov;
        }
      })
      // session is the payload to save in the token, it may contain basic info about the user
      const session = { ...user,providerId:provider.id}
      delete session.password;delete session.pass;
      const token = await createUserToken(res, session);
      res.status(200).send({ done: true,token});
    } catch (error) {
      console.error(error," authentication user")
      res.status(error?.status||UNAUTHORIZED).send(error)
    }
}).handler();
