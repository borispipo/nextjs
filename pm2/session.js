const {Session,extendObj} = require("@fto-consult/node-utils");
const {getAppName} = require("./program");

const session = Session({appName:getAppName()});

const sessionKey = "PM2-SESSION-KEY";

const checkSession = ()=>{
    if(!session.hasSession){
        throw {message : `Impossible de récupérer où sauvegarder les options d'administration de l'instance du serveur. car le repertoire de sauvegarde des session n'autorise pas l'écriture des fichiers.`};
    }
    return true;
}
const getOptions = ()=>{
    checkSession();
    const appName = getAppName();
    const apps = appName?{[appName]:{}}:null
    const opts = extendObj(true,{},{apps},{currentAppName:appName},session.get(sessionKey));
    return opts;
}

const setOptions = (options,override=true)=>{
    return session.set(sessionKey,extendObj(true,{},override !== true ? getOptions():{},options));
}

module.exports = {...session,checkSession,getOptions,setOptions};