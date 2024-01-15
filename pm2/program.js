
const program = require('commander')
const path = require("path");
const fs = require("fs");
let packagePath = path.resolve(process.cwd(),"package.json");
if(!fs.existsSync(packagePath)){
    packagePath = path.resolve(__dirname,"..","package.json");
}
let packageJSON = {};
try {
  packageJSON = fs.existsSync(packagePath)?  require(packagePath) : {};
} catch{};

program
  .name("start")
  .description(`permet de déparer l'instance du serveur de l'application ${packageJSON?.name && `[${packageJSON.name}]` ||""}`)
  .option('-r, --root [dir]', 'le repertoire root de l\'application, par défaut le répertoire dans lequel la commande à été exécutée')
  .option('-p, --port [number]', 'le port de l\'application, la valeur par default est 3000')
  .option('-h, --hostname [url]', 'l\'hôte de l\'application, la valeur par default est localhost')
  .option("-m, --mode [production|development]"," le mode de démarrage de l'application, par défaut production")
try {   
    program.parse(process.argv);
} catch{};
const programOptions = Object.assign({},program.opts());
const hostname = programOptions.hostname || process.env.HOSTNAME || 'localhost';
const port = parseInt(programOptions.port||process.env.port) || 3000
const pRoot = programOptions.root && path.resolve(programOptions.root) || null;
const projectRoot = pRoot && fs.existsSync(pRoot)? pRoot : process.cwd();
const dev = programOptions.mode ==="development"? true : false;

module.exports = {
    ...programOptions,
    hostname,
    port,
    projectRoot,
    dev,
    packageJSON,
}
