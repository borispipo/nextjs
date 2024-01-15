const {start} = require("./pm2");
const session = require("./session");
const {getAppName} = require("./program");
const name = getAppName(); 
const path = require("path");
let options = {};
try {
  options = session.getOptions();
} catch(e){
  console.error(e," starting pm2");
}
if(!name){
  throw {message:`Nom de l'applicaton invalide, impossible de démarrer l'application via pm2`};
}
options = Object.assign({},options);
const apps = options.apps = Object.assign({},options.apps);
apps[name] = {
  ...Object.assign({},apps[name]),
  script : path.resolve(__dirname,"server.js")
};
start({app}).then((opts)=>{
  console.log(`server started with pm2 for the application ${name}`);
}).catch((e)=>{
  console.error(e," starting pmn Server");
});

