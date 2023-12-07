const path = require("path");
const packageJSON = require(path.resolve(__dirname,"..","package.json"));

/*** @see : https://www.npmjs.com/package/commander */
const { program } = require('commander');

module.exports.package = {
    ...Object.assign({},packageJSON),
}

module.exports.program = program;