import Sites from "$models/Sites";
import {NOT_FOUND,SUCCESS,INTERNAL_SERVER_ERROR} from "$api"

export default async function handler (req,res){
    const {code} = req.query;
    try {
        await Sites.init();
        const data = await Sites.repository.findOne({
            where : {
                code,
            },
            raw : true,
        });
        res.status(data?SUCCESS:NOT_FOUND).json({data});
    } catch(e){
        res.status(INTERNAL_SERVER_ERROR).json({message:e.toString()})
    }
}