const {Session} = require("@fto-consult/node-utils");
const {packageJSON} = require("./program");

const session = Session({appName:packageJSON?.name});

const sessionKey = "PM2-SESSION-KEY";

const checkSession = ()=>{
    if(!session.hasSession){
        throw {message : `Impossible de récupérer où sauvegarder les options d'administration de l'instance du serveur. car le repertoire de sauvegarde des session n'autorise pas l'écriture des fichiers.`};
    }
    return true;
}

const getOptions = ()=>{
    checkSession();
    return Object.assign({},session.get(sessionKey));
}

const setOptions = (options)=>{
    return session.set(sessionKey,{...getOptions(),...Object.assign({},options)});
}

module.exports = {...session,checkSession,getOptions,setOptions};