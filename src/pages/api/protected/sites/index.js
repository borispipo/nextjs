import Sites from "$models/Sites";
import {NOT_FOUND,SUCCESS,INTERNAL_SERVER_ERROR,getRequestData} from "$api"


export default async function handler (req,res){
    
    try {
        const options = getRequestData(req);
        const method = options.findAndCount?'findAndCount':'find';
        await Sites.init();
        const data = await Sites.repository[method](options);
        res.status(data?SUCCESS:NOT_FOUND).json({data});
    } catch(e){
        res.status(INTERNAL_SERVER_ERROR).json({message:e.toString()})
    }
}