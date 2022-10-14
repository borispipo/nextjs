import {SUCCESS } from "$api/status";

export default function handle(req,res){
    res.status(SUCCESS).json("you are online");
}