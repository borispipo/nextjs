import {createRouter} from "$next-connect";
import { withCustomerSession } from "$nauth";
import {NOT_ACCEPTABLE,SUCCESS,INTERNAL_SERVER_ERROR} from "$api/status";
import {defaultObj,isNonNullString,isObj} from "$utils";
import Sites from "$models/Sites";

/**** l'api d'assignation d'un domaine, prend en paramètre le précédent domaine assigné. 
 *  dans le champ previousDomain de req.body. 
 *  si cette valeur est non nulle, alors une fois qu'on ait assigné le domaine actuel, on désasigne cet ancien domaine
 */
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
    const {previousDomain} = body;
    const fields = Sites.fields;
    const {data,error,message:errorMessage} = Sites.validate({data:body,fields,filter:({columnField})=>{
        return columnField != "domain" && columnField != "name" 
            && columnField !="type" && columnField !='region'
        ? true : false;
    }});
    if(error){
        return res.status(NOT_ACCEPTABLE).json({status:NOT_ACCEPTABLE,message:errorMessage});
    }
    if(!isNonNullString(data.deviceCode)){
        return res.status(status).json({message:"le champ [{0}] est requis.".sprintf(Sites.fields.deviceCode.title)})
    }
    try {
        await Sites.repository.save({
            ...domain,
            ...data,
            isAssigned : 1,
        });

        if(isNonNullString(previousDomain)){
            try {
                const prevDomain = await Sites.repository.findOne({
                    where : {
                        domain : previousDomain,
                        customerCode : customer.code,
                    }
                });
                ///on désassigne le domaine précédent
                if(isObj(prevDomain)){
                    await Sites.repository.save({
                        ...prevDomain,
                        isAssigned : 0,
                        deviceCode : "",
                        deviceHost : "",
                        deviceComputername : "",
                    })
                }
            } catch {};
        }
        res.status(SUCCESS).json({done:true});
    } catch(e){
        return res.status(INTERNAL_SERVER_ERROR).json(e);
    }
})).handler();