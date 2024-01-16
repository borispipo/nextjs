"use client"
import { notifyRef} from "$common/notify";
import {toast } from 'react-toastify';
import { isNonNullString } from "$cutils";
import 'react-toastify/dist/ReactToastify.min.css';

export * from "$common/notify";

export {default} from "$common/notify";

//@see : https://fkhadra.github.io/react-toastify/introduction/
notifyRef.current = ({type,message,...rest})=>{
    type = isNonNullString(type) ? type.trim().toLowerCase() :"info";
    if(typeof toast[type] !== "function"){
        type = "info";
    }
    return toast[type](message,rest);
}