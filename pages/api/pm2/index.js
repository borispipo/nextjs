import {get,handleError} from "$nrequestHandler";
import { extendObj } from "$cutils";
const {list} = require("$npm2");
export default get(async function(req,res){
    const options = extendObj({},req.query,req.body);
    try {
        const data = await list(options.process);
        res.json({data});
    } catch(e){
        handleError(e,res);
    }
},{method:"get,post"});