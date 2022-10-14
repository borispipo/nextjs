import Customers from "$models/Customers";
import client from "./common";
export default {
    ...client,
    name : "Customers",
    authorize : async function({req,data,Model,...rest}) {
        const customer = await Customers.getCustomer({...rest,...data,checkPassword:true});
        if(typeof customer =='object' && customer && !Array.isArray(customer)){
            return customer;    
        }
        return null;
    },
}