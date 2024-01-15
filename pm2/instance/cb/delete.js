const {delete:deleteMe} = require("../../pm2");
const {appName} = require("./options");
module.exports = (process)=>{
  return deleteMe(typeof process =="string" && process || appName); 
}