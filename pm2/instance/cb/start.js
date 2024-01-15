const {start} = require("../../pm2");
const {appName,mainApp,...options} = require("./options");
module.exports = function(){
  return start(options);  
}
