import {UNAUTHORIZED,NOT_ACCEPTABLE} from "$capi/status";
import {getProvider,createUserToken} from "$nauth";
import {isObj,defaultObj,isNonNullString,defaultStr,extendObj} from "$cutils";
import {post} from "$napiRequestHandler";
import {isJSON,parseJSON} from "$utils/json";
import {AUTH} from "$nevents";
import "$date";
/** 
 * @apiDefine ProiverNotFound lorsque le provider n'a pas été précisé dans les données passé à la requête
 */
/** @apiDefine DataNotFound Données innexistante où mot de passe incorrecte  */
/**
  @api {post} /auth/signin Authentifier un utilisateur
  @apiName {SignIn}
  @apiGroup auth
  @apiBody {string} providerId l'id du gestionnaire d'authentification à utiliser pour l'authentification de l'utilisateur
  @apiBody {Object} ...others les données supplémentaires à passer à la fonction authorize du provider pour authentifier l'utilisateur 
* @apiSuccess (200) {boolean} done=true pour spécifier que l'opération s'est déroulée avec succès
* @apiSuccess (200) {String} token  le jetton Bearer généré pour servir lors des prochaines connexions de l'utilisateur
* @apiSuccess (200) {object} ...rest les données supplémentaires liées à l'authentification de l'utilisateur, celles-ci sont fonction de l'implémentation d'un backend utilisant le boiletplate
* @apiVersion 1.0.0
* @apiSuccessExample Success-Response:
*     HTTP/1.1 200 OK
*     {
*       "done": true,
*       "token": "eyJhbGciOiJIUzI1NiJ9.eyJjb2RlIjoiQ0NSQyIsImxhYmVsIjoiQ0NSQyBTQVJMIiwic3RhdHVzIjoxLCJlbWFpbCI6ImNjcmNAZ21haWwuY29tIiwicHJvdmlkZXIiOnsiaWQiOiJjdXN0b21lciIsIm5hbWUiOiJDdXN0b21lcnMifSwicHJvdmlkZXJJZCI6ImN1c3RvbWVyIiwiaXNDdXN0b21lciI6dHJ1ZSwiY3JlYXRlZEF0IjoxNjY1ODQ4Mzk1NTIwLCJtYXhBZ2UiOjI1OTIwMCwiaWF0IjoxNjY1ODQ4Mzk1LCJleHAiOjE2NjY0NTMxOTV9.Ea1Q4GbsUP1hQxh4PTCh8yY--eTvz-Txq_dClrx1HyA"
*     }
*/

export default post((async (req, res,options) => {
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
      const date = new Date();
      const geo = req.geo ? req.geo : {};
      const login = await provider.authorize({date,dateSQL : date.toSQLFormat(),timeSQL:date.toSQLTimeFormat(),dateTimeSQL:date.toSQLDateTimeFormat(),req,res,request:req,geo,data:req.body,query:defaultObj(req.query)})
      if(isNonNullString(login)){
        return res.status(UNAUTHORIZED).send({message: login});
      }
      ///permet d'autentifier l'utilisateur en spéfiant la méthode en paramètre
      if(!isObj(login)){
         return res.status(UNAUTHORIZED).send({message:'Données innexistante où mot de pass incorrect pour le gestionnaire d\'autentification [{0}]'.sprintf(defaultStr(provider.label,provider.name,provider.id))});
      }
      const p = {};
      Object.map(provider,(prov,i)=>{
        if(typeof prov !== 'function' && i !=='credentials' && i !='modelName' && i!='modelNames' && typeof prov !=='object'){
            p[i] = prov;
        }
      });
      const {mutator,beforeGenerateToken} = defaultObj(options);
      ///la fonction utilisée pour muter les données de session, ie les données qui seront retournées à l'utilisateur
      // session is the payload to save in the token, it may contain basic info about the login
      const session = { ...login,providerId:provider.id}
      delete session.password;delete session.pass;
      session.perms = isJSON(session.perms)? parseJSON(session.perms) : defaultObj(session.perms);
      session.preferences = isJSON(session.preferences)? parseJSON(session.preferences) : defaultObj(session.preferences);
      ////la fonction before generate token est appelée pour personnaliser le contenu devant figurer dans le token à générer
      typeof beforeGenerateToken =='function' && beforeGenerateToken(session);
      /*** l'objet session doit avoir commme id, une unique chaine de caractère où un nombre entier définie dans la props loginId */
      if(!isNonNullString(session.loginId) && typeof session.loginId !='number'){
        return res.status(NOT_ACCEPTABLE).json({message:'Données de sessions invalidates. Le fournisseur d\'authentification ne définie aucune valeur (props loginId) identifiant de manière unique, la session à persister. La fonction autorize du provider doit retourner un objet ayant à la prop loginId, une chaine de caractère non nulle ou un nombre entier identifiant de manière unique, l\'utilisateur où la connection, où la resource demandant à être authentifiée'});
      }
      const token = await createUserToken(res, session);
      const result = {...session,token};
      const r = typeof mutator == 'function'? await mutator({...result,session}) : null; 
      if(isObj(r)){
        extendObj(true,result,r);
      };
      AUTH.emit("signin",r);
      res.status(200).send(result);
    } catch (error) {
      console.error(error," authentication login")
      if(isNonNullString(error)){
        error = {message:error};
      }
      res.status(error?.status||UNAUTHORIZED).send(error)
    }
}));
