import getCustomer from "./[code]";
import {withCustomerSession} from "$nauth";

///le mot de passe doit être passé au format base64
///nextjs bug on first query param : @see : https://github.com/vercel/next.js/discussions/11484
/**** retourne le code du tiers passé en paramètre */
export default withCustomerSession(async function handler (req,res){
    return await getCustomer(req,res,req.session.code);
});