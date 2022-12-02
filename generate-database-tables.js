// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
const isNonNullString = x=> x && typeof x =='string';
const fs = require("fs");
const path = require("path");
const StringBuilder = require("string-builder");
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
    paths = paths && typeof paths =='object' ? paths : {};
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
                                const tbName = path.basename(path.dirname(fromPath));
                                const tableName = tbName?.toUpperCase();
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
                                            const tablePath = path.join(dPath,"table.js");
                                            const indexPath = path.join(dPath,"index.js");
                                            const srcI18nPath = path.join(srcPath,"i18n.js");
                                            const destI18nPath = path.join(dPath,"i18n.js");
                                            writeFile(path.join(dPath,file),jsContent);
                                            
                                            ///on crèe le fichier table name
                                            writeFile(tablePath,"export default \""+tableName+"\";");
                                            if(!fs.existsSync(indexPath)){
                                                const indexStr = "export default \n{\n\ttableName : require('./table').default,\n\tfields : require('./"+file.replaceAll(ext,"")+"').default,\n}";
                                                writeFile(indexPath,indexStr);
                                            }
                                            if(fs.existsSync(srcI18nPath)){
                                                writeFile(destI18nPath,fs.readFileSync(srcI18nPath)?.toString())
                                            }
                                            paths[srcPath]= dPath;
                                            console.log("******************** ",fromPath, " is generated")
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
                return Promise.all(promises).then(resolve).catch(reject).finally(()=>{
                    let i18nstr= "import i18n from '$i18n';";
                    let rootPath = null;
                    tablesBuilder.appendLine("export default {");
                    const getTalbebuilder = new StringBuilder();
                    const getAccordionPropsBuilder = new StringBuilder();
                    let hasTables = false,hasAccordionProps = false;
                    for(let srcPath in paths){
                        const destPath = paths[srcPath];
                        if(fs.existsSync(destPath)){
                            const i18nP = path.join(destPath,"i18n.js");
                            const tableName = path.basename(destPath);
                            rootPath = rootPath || path.resolve(path.join(destPath,".."));
                            if (!hasTables)
                            {
                                hasTables = true;
                                getTalbebuilder.appendLine("export default (tableName)=>{");
                                getTalbebuilder.appendLine("\tif(!isNonNullString(tableName)) return null;");
                                getTalbebuilder.appendLine("\ttableName = tableName.toUpperCase().trim();");
                                getTalbebuilder.appendLine("\tswitch(tableName){");
                            }
                            getTalbebuilder.appendLine("\t\tcase {0}:{try{ return require('./{1}').default;} catch{return null;}}".sprintf(table.NameInJavascript.EscapeDoubleQuote(), table.NameInJavascript));
                            
                            const accordionExist = fs.existsSync(path.join(srcPath, "accordion.js"));
                            const accordionPropsExist = fs.existsSync(path.join(srcPath, "accordionProps.js"));
                            if(fs.existsSync(i18nP)){
                                i18nstr+="\n";
                                i18nstr+="i18n.dictionary(require('./"+tableName+"/i18n').default);"
                            }
                            if(accordionExist || accordionPropsExist)
                            {
                                if (!hasAccordionProps)
                                {
                                    hasAccordionProps = true;
                                    getAccordionPropsBuilder.appendLine("export default (tableName)=>{");
                                    getAccordionPropsBuilder.appendLine("\tif(!isNonNullString(tableName)) return null;");
                                    getAccordionPropsBuilder.appendLine("\ttableName = tableName.toUpperCase().trim();");
                                    getAccordionPropsBuilder.appendLine("\tswitch(tableName){");
                                }
                                getAccordionPropsBuilder.appendLine("\t\tcase {0}: return {".sprintf(table.NameInJavascript.EscapeDoubleQuote(), table.NameInJavascript));
                                if (accordionExist)
                                {
                                    getAccordionPropsBuilder.appendLine("\t\t\t{0}:require('./{1}/accordion').default,".sprintf("accordion".EscapeDoubleQuote(),table.NameInJavascript));
                                }
                                if (accordionPropsExist)
                                {
                                    getAccordionPropsBuilder.appendLine("\t\t\t{0}:require('./{1}/accordionProps').default,".sprintf("accordionProps".EscapeDoubleQuote(), table.NameInJavascript));
                                }
                                ///on ferme la clause du case
                                getAccordionPropsBuilder.appendLine("\t\t};");
                            }
                        }
                    }
                    if(fs.existsSync(rootPath)){
                        if (hasTables)
                        {
                            ///on ferme la clause switch
                            getTalbebuilder.appendLine("\t}");
                            ///on ferme la clause d'ouverture de la fonction
                            getTalbebuilder.appendLine("}");
                            writeFile(path.join(rootPath, "getTable.js"), getTalbebuilder.toString, true);
                        }
                        if (hasAccordionProps)
                        {
                            ///on ferme la clause switch
                            getAccordionPropsBuilder.appendLine("\t}");
                            getAccordionPropsBuilder.appendLine("\treturn undefined;");
                            ///on ferme la clause d'ouverture de la fonction
                            getAccordionPropsBuilder.appendLine("}");
                            writeFile(path.join(rootPath, "getAccordionProps.js"), getAccordionPropsBuilder.toString(), true);
                        }
                        writeFile(path.join(rootPath,"i18n.js"),i18nstr);
                    }
                });
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

String.prototype.sprintf = function ()
{
    const args = Array.prototype.slice.call(arguments,0);
    const str = this.toString();
    if (!(str)) return "";
    args.map((s,index)=>{
        if(typeof s !='string'){
            if(s === null) s = "";
            s = s?.toString() || '';
        }
        const replace = s ? "" : (!s? "" : s);
        str = str.Replace("{" + index + "}", replace);
    });
    return str;
}