import {createRouter} from "$next-connect";
import { withCustomerSession } from "$nauth";
import {NOT_ACCEPTABLE,SUCCESS,INTERNAL_SERVER_ERROR} from "$api/status";
import {defaultObj,isNonNullString,isObj} from "$utils";
import Sites from "$models/Sites";
import {isJSON} from "$utils/json";

export default createRouter().post(withCustomerSession(async (req,res)=>{
    const body = defaultObj(req.body);
    const customer = req.session;
    const status = NOT_ACCEPTABLE;
    if(!isNonNullString(body.domain)){
        return res.status(status).json({status,message:'Vous devez spécifier un nom de domaine valide'});
    }
    await Sites.init();
    const domain = await Sites.repository.findOne({
        where : {
            domain : body.domain,
            customerCode : customer.code,
        }
    });
    if(!isObj(domain)){
        return res.status(status).json({status,message:"Le domaine [{0}} ne figure pas parmi la liste des domaines assignés au client [{1}] {2}".sprintf(body.domain,customer.code,customer.label)});
    }
    const {dataSources} = req.body;
    if(!isNonNullString(dataSources) && !isJSON(dataSources)){
        return res.status(status).json({status,message:'la sources de données {0} est invalide. Vous devez fournir un ensemble de sources de données au format json valide'});
    }
    try {
        await Sites.repository.save({
            ...domain,
            dataSources,
        });
        res.status(SUCCESS).json({done:true});
    } catch(e){
        return res.status(INTERNAL_SERVER_ERROR).json(e);
    }
})).handler();