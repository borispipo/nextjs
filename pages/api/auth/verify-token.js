import {UNAUTHORIZED,NOT_ACCEPTABLE,SUCCESS} from "$capi/status";
/**** cette route permet de vérifier si le token utilisateur passé en paramètre est à jour où nom */
import {createRouter} from "$next-connect";
import { getUserSession } from '$nauth/utils/auth-cookies';
import {isObj} from "$cutils";

export default createRouter().post(async (req, res)=>{
    if(!isObj(req.body)){
        res.status(NOT_ACCEPTABLE).json({message:'Vous devez spécifier un jetton de sécurité valide'});
        return;
    }
    try {
        const session = await getUserSession(req,req.body.token);
        if(!isObj(session)){
           return res.status(UNAUTHORIZED).json({message:'Le jeton de sécurité distant a expiré!! essayez de vous connecter sur le site distant avec votre compte client puis réessayez!!'});
        } 
        return res.status(SUCCESS).json(session)
    } catch (error) {
        console.error(error," authentication user")
        res.status(error?.status||UNAUTHORIZED).send(error)
    }
}).handler();