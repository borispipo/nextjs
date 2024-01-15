import {get,handleError} from "$nrequestHanlder";
import { extendObj } from "@fto-consult/node-utils";
import {list} from "$pm2";
export default get(async function(req,res){
    const options = extendObj({},req.query,req.body);
    try {
        const data = await list(options.process);
        res.json({data});
    } catch(e){
        handleError(e,res);
    }
},{method:"get,post"});