const {start} = require("./pm2");
const session = require("./session");
const {packageJSON} = require("./program");
const name = typeof packageJSON?.name=="string" && packageJSON?.name.trim() || ""; 
let options = {};
try {
  options = session.getOptions();
} catch(e){
  console.error(e," starting pm2");
}
if(name && options && options[name]){
  options[name] = Object.assign({},options[name]);
  options[name].script = "./server.js";
}
start(options).then((opts)=>{
  console.log(`server started with pm2 for the application ${name}`);
}).catch((e)=>{
  console.error(e," starting pmn Server");
});

