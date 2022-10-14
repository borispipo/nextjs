import Sites from "$models/Sites";
import {getRequestData} from "$api";
import { isObj } from "$utils";
import {withCustomerSession} from "$nauth";

/**** 
 * retourne la liste des sites 
 * 
*/
export default withCustomerSession(async function handler (req,res){
    const options = getRequestData(req);
    options.where = isObj(options.where)? options.where : {};
    options.where.customerCode = req.session.code;
    await Sites.init();
    const data = await Sites.repository.find(options);
    res.status(200).json({data});
});