const path = require("path"), fs = require("fs");
let packagePath = path.resolve(process.cwd(),"package.json");
if(!fs.existsSync(packagePath)){
    packagePath = path.resolve(__dirname,"..","package.json");
}

if(fs.existsSync(packagePath)){
    try {
        const p = fs.existsSync(packagePath)?  JSON.parse(fs.readFileSync(packagePath, 'utf8')) : {};
        module.exports = Object.assign({},p);
    } catch (e){
        console.error(e," getting package json");
        module.exports = {};
    };
} else {
    module.exports = {};
}
