const {stop} = require("../../pm2");
const {appName} = require("./options");
module.exports = (process)=>stop(typeof process =="string" && process || appName); 
