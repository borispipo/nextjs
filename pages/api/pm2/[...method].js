import {get,handleError} from "$nrequestHandler";
import { extendObj,isNonNullString,defaultStr} from "$cutils";
const pm2 = require("$pm2");
const methods = ["start","stop","list"];
const cbActions = require("$pm2/instance/cb");
const oMethods = ["instance","options"];
const instanceMethods = Object.keys(cbActions).filter(a=>a!=="options");

/****
    examples : 
    /pm2/list : liste les instances pm2
    /pm2/instance/start : demarre l'instance courrange
    /pm2/instance/stop/[instanceName|default], arrête l'instance dont le nom est passé en paramètre
    /pm2/instance/restart/[instanceName|default], redemarre l'instance 
    /pm2/instance/delete/[instanceName|default], supprime l'instance dont le nom est passé
    
    -- route des ooptions : 
    [put] /pm2/options?.... permet de définir les options pn2
    [get] /pm2/options, recupère les options pm2
*/
export default get(async function(req,res){
    const {method:m} = req.query;
    const m2 = Array.isArray(m)? defaultStr(m[0]).toLowerCase() : isNonNullString(m)? m.toLowerCase() : "";
    const method = oMethods.includes(m2) || methods.includes(m2)? m2 : "list";
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
        } else if(method ==="instance"){
            const action = m[1]?.toLowerCase();
            const processName = typeof[m2]=="string" && m[2] || options.process;
            if(!action || !instanceMethods.includes(action)){
                throw {message:`methode ${action} inconnue pour l'instance pm2. les actions supportées sont : ${instanceMethods.join(",")}`}
            }
            await cbActions[action](processName);
            res.json({message:`L'action ${action} de l'instance pm2 a été exécutée avec succès!!`});
            return;
        }
        const data = await pm2[method](options.process);
        res.json({data});
    } catch(e){
        handleError(e,res);
    }
},{method:"get,post"});