import Customers from "$models/Customers";
import {INTERNAL_SERVER_ERROR,SUCCESS} from "$api/status";
import {isNonNullString,isObj,defaultStr,defaultObj} from "$utils";
import {withSession} from "$nauth";

///le mot de passe doit être passé au format base64
///nextjs bug on first query param : @see : https://github.com/vercel/next.js/discussions/11484
/**** retourne le code du tiers passé en paramètre */
export default withSession(async function handler (req,res,code){
    try {
        const query = defaultObj(req.query);
        query.code = defaultStr(query.code,code);
        const data = await Customers.getCustomer(query);
        res.status(SUCCESS).json({data});
    } catch(e){
        console.error(e," found in getting customer apid")
        if(isObj(e) && "status" in e && isNonNullString(e.message)){
            return res.status(e.status).json(e);
        }
        res.status(INTERNAL_SERVER_ERROR).json({message:e.toString()})
    }
});