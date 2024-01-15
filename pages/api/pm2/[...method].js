import {get,handleError} from "$nrequestHandler";
import { extendObj,isNonNullString,defaultStr} from "$cutils";
const pm2 = require("$pm2");
const methods = ["start","stop","list","options"];

export default get(async function(req,res){
    const {method:m} = req.query;
    const m2 = Array.isArray(m)? defaultStr(m[0]).toLowerCase() : isNonNullString(m)? m.toLowerCase() : "";
    const method = methods.includes(m2)? m2 : "list";
    const options = extendObj({},req.query,req.body);
    delete options.method;
    try {
        ///permet de définir les paramètres de l'instance pm2 à utiliser pour la gestion du serveur
        if(method ==="options"){
            switch(defaultStr(req.method).toLowerCase()){
                case "put":
                    const s = pm2.setOptions(options);
                    res.json({message:`Les options de l'instance pm2 on été définis avec succès`});
                    break;
                    default : 
                        res.json({data:pm2.getOptions()});
                        break;
            } 
            return res.end();
        }
        const data = await pm2[method](options.process);
        res.json({data});
    } catch(e){
        handleError(e,res);
    }
},{method:"get,post"});