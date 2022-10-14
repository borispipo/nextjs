import Customers from "$models/Customers";
import {NOT_FOUND,SUCCESS,INTERNAL_SERVER_ERROR,getRequestData} from "$api";
import {withSession} from "$nauth";


export default withSession(async function handler (req,res){
    try {
        const options = getRequestData(req);
        const method = options.findAndCount?'findAndCount':'find';
        await Customers.init();
        const data = await Customers.repository[method](options);
        res.status(data?SUCCESS:NOT_FOUND).json({data});
    } catch(e){
        res.status(INTERNAL_SERVER_ERROR).json({message:e.toString()})
    }
});