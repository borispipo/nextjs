const {restart} = require("../../pm2");
const {appName} = require("./options");
module.exports = (process)=>{
  return restart(typeof process =="string" && process || appName); 
}