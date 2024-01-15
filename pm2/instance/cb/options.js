const session = require("../../session");
const {getAppName,projectRoot,dir,dev, hostname, port} = require("../../program");
const name = getAppName(); 
const path = require("path");
const fs = require("fs");
let nextPath = require("../../../next-path")();
const nodePath = path.resolve(projectRoot,"node_modules","@fto-consult/nextjs");
if(fs.existsSync(nodePath)){
  nextPath = nodePath;
}
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
const mainApp = apps[name] = {
  ...Object.assign({},apps[name]),
  cwd : dir,
  args : `--root ${projectRoot} --hostname ${hostname} --port ${port} --mode ${dev?"development":"production"}`,
  script : path.resolve(nextPath,"pm2",'server.js')
};
mainApp.env = {
  ...Object.assign({},mainApp.env),
  
  "NODE_ENV" : mainApp?.env?.NODE_ENV || dev ? "development" : "production",
}
mainApp.watch = !!("watch" in mainApp ? mainApp.watch : false);
const appsConf = [];
for(let i in apps){
  const app = apps[i];
  if(app && typeof app =="object"){
    appsConf.push({...app,name:app.name||i});
  }
}
mainApp.name = name;
options.apps = appsConf;
options.appName = name;
options.mainApp = mainApp;
module.exports = options;