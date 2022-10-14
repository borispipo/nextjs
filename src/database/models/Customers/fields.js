import DataTypes from "$ndatabase/schema/DataTypes";
export default {
    code : {
        name : 'cust_code',
        title : "Code client",
        primary :true,
        type : DataTypes.STRING.type ,
        validate: {
            len: [0, 30]
        },
    },
    label : {
        name : 'cust_label',
        title : 'Intitulté client',
        type : DataTypes.STRING.type ,
        nullable : true,
        validate: {
            len: [0, 80]
        }
    },
    status : {
        name : 'cust_status',
        title : "Status du client",
        type : DataTypes.INTEGER.type ,
    },
    email : {
        name : 'cust_email',
        title : "Email",
        type : DataTypes.STRING.type ,
        nullable : true,
        validate: {
            len: [0, 80]
        },
        unique : true,
    },
    password : {
        name : 'cust_password',
        title : "Mot de pass",
        type : DataTypes.STRING.type ,
        nullable : true,
        validate: {
            len: [0, 80]
        },
        unique : true,
    }
}