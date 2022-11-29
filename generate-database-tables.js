// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
const isNonNullString = x=> x && typeof x =='string';
const fs = require("fs");
const path = require("path");
/**** cette fonction prend en paramètre un dossier, options srcPath puis parcoures tous les fichiers du dossiers et sous dossiers
 * à la recherche des models correspondants, les fichier ui héritents de la classe BaseModel
 * elle générera les champs correpondants à la table définit dans le fichier .fields du model en question
 */
module.exports  = (opts,callback)=>{
    opts = typeof opts =='object' && opts ? opts : {};
    callback = typeof callback =='function'? callback : x=>x;
    const {src,dest,srcPath,destPath} = opts;
    const s = isNonNullString(src) && fs.existsSync(src)? src : isNonNullString(srcPath) && fs.existsSync(srcPath)? srcPath : null;
    const d = isNonNullString(dest) && fs.existsSync(dest)? dest : isNonNullString(destPath) && fs.existsSync(destPath)? destPath : null;
    if(!s || !fs.lstatSync(s).isDirectory() ) {
        return callback({message:'Vous devez spécifier un repertoire source valide'});
    }
    if(!d || !fs.lstatSync(d).isDirectory() ){
        return callback({message:'Vous devez specifier un repertire destination valide'});
    }
    parseTable(s,d,{}).then((p)=>{
        callback(false,p);
    }).catch((e)=>{
        console.log(e, " was parsingg")
    });
}
const pp = path.join(__dirname,"src","database","schema","DataTypes","jsTypes");
const models = require(pp);
const parseTable = (srcPath,destPath,paths)=>{
    return new Promise((resolve,reject)=>{
        // Loop through all the files in the temp directory
        try {
            fs.readdir(srcPath,undefined, function (err, files) {
                if (err) {
                    console.error("Could not list the directory.", err);
                    return reject({message:'Could not list the directory. '+err?.message,error:e})
                }
                const promises = [];
                files.forEach(function (file, index) {
                    // Make one pass and make the file complete
                    const fromPath = path.join(srcPath, file);
                    try {
                        const stat = fs.statSync(fromPath);
                        if (stat.isFile()){
                            const ext = path.extname(fromPath)?.toLowerCase();
                            if(file.toLowerCase().includes("fields") && (ext =='.js' || ext =='.ts')){
                                console.log("parsing file ", fromPath);
                                const tableName = path.basename(path.dirname(fromPath))?.toUpperCase();
                                try {
                                    var jsContent = fs.readFileSync(fromPath)?.toString();
                                    if(!isNonNullString(jsContent)) return;
                                    const index  = jsContent.indexOf("export default");
                                    if(!index != -1){
                                        jsContent = jsContent.substring(index,jsContent.length);
                                    } else {
                                        return;
                                    }
                                    let hasFound = false;
                                    for(var m in models){
                                        const mm = models[m];
                                        if(!mm || typeof mm !=='object') continue;
                                        mm.js = isNonNullString(mm.js)? mm.js : "text";
                                        const st = "DataTypes."+m.toUpperCase()+".type";
                                        if(jsContent.includes(st)){
                                            hasFound = true;
                                            jsContent = jsContent.replaceAll(st,"'"+mm.js+"'");
                                        }
                                    }
                                    if(hasFound){
                                        try {
                                            const dPath = path.join(destPath,tableName);
                                            writeFile(path.join(dPath,file),jsContent);
                                            ///on crèe le fichier table name
                                            if(!fs.existsSync(path.join(dPath,"table.js"))){
                                                writeFile(path.join(dPath,"table.js"),"export default \"%s%\";",tableName);
                                            }
                                            if(!fs.existsSync(path.join(dPath,"index.js"))){
                                                writeFile(path.join(dPath,"index.js"),"export default \n{\n\ttableName : '"+tableName+"',\n\tfields : require('./'"+file.replaceAll(ext,"")+") \"%s%\";}",tableName);
                                            }
                                        } catch{}
                                    }
                                } catch(e){
                                    console.log(e," parsing model",fromPath);
                                    //reject({message:'Error on lokking for file '+fromPath,error:e})
                                }
                            }
                        } else if (stat.isDirectory()){
                            //console.log("parsing '%s' directory", fromPath);
                            promises.push(parseTable(fromPath,destPath,paths));
                        }
                    } catch(error){
                        console.error("Error stating file.", error);
                        return;
                    }
                });
                return Promise.all(promises).then(resolve).catch(reject);
            });
        } catch(e){
            console.log("parsing model ",e);
            reject({message:'Error when parsing model '+e?.message,error:e});
        }
    })
}

const getDirName = require('path').dirname;

function writeFile(path, contents, cb) {
  const p = getDirName(path);
  if(!fs.existsSync(p)){
     try {
        fs.mkdirSync(p,{ recursive: true});
     } catch(e){}
  }
  if(fs.existsSync(p)){
    return fs.writeFileSync(path, contents, cb);
  }
  throw {message : 'impossible de créer le repertoire '+p};
}
