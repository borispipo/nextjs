import {get,handleError} from "$nrequestHandler";
import { extendObj,isNonNullString,defaultStr} from "$cutils";
import pm2 from "$pm2";
const methods = ["start","stop","list"];
export default get(async function(req,res){
    const {method:m} = req.query;
    const m2 = Array.isArray(m)? defaultStr(m[0]).toLowerCase() : isNonNullString(m)? m.toLowerCase() : "";
    const method = methods.includes(m2)? m2 : "list";
    const options = extendObj({},req.query,req.body);
    try {
        const data = await pm2[method](options.process);
        res.json({data});
    } catch(e){
        handleError(e,res);
    }
},{method:"get,post"});