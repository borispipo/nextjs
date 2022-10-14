import { DataTypes } from "../Base"
import {defaultStr} from "$utils";
export default {
    pseudo : {
        name : 'user_pseudo',
        type: DataTypes.STRING.type,
        primary: true,
        nullable: false,
        title : "Pseudo",
        unique: true,
        validate: {
            len: [0,30]
        }
    },
    password : {
        name : 'user_password',
        title : "Mot de pass",
        filter : false,
        sortable : false,
        type : DataTypes.STRING.type ,
        nullable : false,
        validate: {
            len: [0, 45]
        },
        render : (text)=>{
            const i = defaultStr(text).length;
            let r = "";
            for(let k = 0; k<i;k++){
                r+=".";
            }
            return r;
        }
    },
    firstName : {
        name : 'user_first_name',
        title : 'Prenom',
        type : DataTypes.STRING.type ,
        nullable : true,
        validate: {
            len: [0, 60]
        }
    },
    lastName : {
        name : 'user_last_name',
        title : "Nom complet",
        type : DataTypes.STRING.type ,
        nullable : true,
        validate: {
            len: [0, 60]
        }
    },
    email : {
        name : 'user_email',
        title : "Email",
        type : DataTypes.STRING.type ,
        nullable : true,
        validate: {
            len: [0, 45]
        }
    },
}