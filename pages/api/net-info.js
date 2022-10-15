import {SUCCESS } from "$capi/status";

export default function handle(req,res){
    res.status(SUCCESS).json("you are online");
}