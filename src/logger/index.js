import appConfig from "$capp/config";
const {logger} = require("@fto-consult/node-utils");
try {
    logger.setConfig("appName",appConfig.name);
} catch(e){
    console.log("setting logger config ",e,logger);
}

export default logger;