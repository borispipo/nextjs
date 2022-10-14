import {UNAUTHORIZED,NOT_ACCEPTABLE} from "$capi/status";
import { createRouter } from "$next-connect";
import {getProvider,createUserToken} from "$nauth";
import {isObj,defaultObj,isNonNullString} from "$cutils";

export default createRouter().post(async (req, res) => {
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
         return res.status(UNAUTHORIZED).send({message:'Utilisateur innexistant où mot de pass incorrect'});
      }
      const p = {};
      Object.map(provider,(prov,i)=>{
        if(typeof prov !== 'function' && i !=='credentials' && i !='modelName' && i!='modelNames' && typeof prov !=='object'){
            p[i] = prov;
        }
      })
      // session is the payload to save in the token, it may contain basic info about the user
      const session = { ...user,provider:p,providerId:provider.id,isCustomer:provider.id=='customer'?true:false}
      delete session.password;delete session.pass;
      const token = await createUserToken(res, session);
      res.status(200).send({ done: true,token});
    } catch (error) {
      console.error(error," authentication user")
      res.status(error?.status||UNAUTHORIZED).send(error)
    }
}).handler();
