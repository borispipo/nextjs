export const id = "customer";
const customerProvider = {
    id ,
    name :"Compte client",
    credentials: {
        code : { label: "Code client", type: "text ", required:true},
        password: { label: "Mot de pass", type: "password", required:true},
    },
    /**
     *  pour éviter les erreurs sequelize du type : Module not found: Can't resolve 'pg-hstore', le champ name
     * doit être préciser, ça servira à la routine /api/auth/signin de charger le model en question dans la propriété intitulé Model, passé en options à la
     * fonction authorize
     */
    name : "Customers", ///le model à utiliser
    /*** la liste des models à exploiter pour l'authentification utilisateur, afin d'éviter les erreurs sequelize de type : pour éviter les erreurs sequelize du type : Module not found: Can't resolve 'pg-hstore', le champ name
     * ces models seront exploités dans la variable Models, des options passés en paramètre à la fonction authorize du provider
     */
    modelNames : ['Customer'],
};
export default customerProvider;