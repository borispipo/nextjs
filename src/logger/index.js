import appConfig from "$capp/config";
const {logger} = require("@fto-consult/node-utils");

logger.setConfig("appName",appConfig.name);

export default logger;