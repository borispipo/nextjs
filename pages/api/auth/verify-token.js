import {UNAUTHORIZED,NOT_ACCEPTABLE,SUCCESS} from "$capi/status";
/**** cette route permet de vérifier si le token utilisateur passé en paramètre est à jour où nom */
import {post,logError} from "$requestHandler";
import { getProviderSession } from '$nauth/utils/auth-cookies';
import {isObj} from "$cutils";

/****
 * @api {post} /auth/verify-token Vérifie la validité d'un token
 * @apiName {Verify Token}
 * @apiGroup auth
 * @apiBody {string} token le token a vérifier
 * @apiSuccess {object} session l'objet session correspondant à la session associé au token au cas où il est valide
 * @apiVersion 1.0.0
 * @apiSuccess {object} ...session l'objet session rattaché au token lorsqu'il est valide
 */
export default post((async (req, res)=>{
    if(!isObj(req.body)){
        res.status(NOT_ACCEPTABLE).json({message:'Vous devez spécifier un jetton de sécurité valide'});
        return;
    }
    try {
        const session = await getProviderSession(req,req.body.token);
        if(!isObj(session)){
           return res.status(UNAUTHORIZED).json({message:'Le jeton de sécurité distant a expiré!! Merci de vous reconnecter (Déconnexion/Connexion) via votre application cliente puis essayez puis réessayez!!'});
        } 
        return res.status(SUCCESS).json(session)
    } catch (error) {
        logError(error,req,res);
        res.status(error?.status||UNAUTHORIZED).send(error)
    }
}));