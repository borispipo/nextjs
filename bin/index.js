#!/usr/bin/env node
/**@see : https://blog.shahednasser.com/how-to-create-a-npx-tool/ */
'use strict';
process.on('unhandledRejection', err => {
  throw err;
});
const supportedScript = {
  "start" : true,//start electron
  "generate-api" : true, //generate api
  "generate-tables" : true, ///generate all tables appllication
}

const parsedArgs = require("./paseArgs")(null,supportedScript);
if(!parsedArgs.script || !(parsedArgs.script in supportedScript)){
   console.error ("Erreur : script invalide, vous devez spécifier script figurant parmi les script : ["+Object.keys(supportedScript).join(", ")+"]");
   process.exit();
}
const script = typeof parsedArgs.script =='string' ? parsedArgs.script.toLowerCase().trim() : "start";

if(script?.toLowerCase() =='start'){
  require("./start");
} else if(script ==="generate-tables"){
  require("./generate-tables");
} else {
  process.exit();
}