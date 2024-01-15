const session  = require('@fto-consult/common/src/session/index.node');
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

module.exports = {checkSession,getOptions,setOptions};