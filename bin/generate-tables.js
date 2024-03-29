// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
const {package,program} = require("./utils");
const isNonNullString = x=> x && typeof x =='string';
const fs = require("fs");
const fsExtra = require('fs-extra')
const path = require("path");
const StringBuilder = require("string-builder");

const getArgPath = (paths)=>{
    if(Array.isArray(paths)){
        for(let i in paths){
            const p = getArgPath(paths[i]);
            if(p) return p;
        }
    }
    if(typeof paths ==='string'){
        const p2 = paths.trim();
        const p = path.resolve(p2);
        if(fs.existsSync(p)) return p;
    }
    return null;
}
program
  .command("generate-tables")
  .description(`prend en paramètre un dossier, options -s|--src puis parcours tous les fichiers du dossiers et sous dossiers
  à la recherche des models correspondants, les fichier ui héritents de la classe BaseModel.  elle générera les champs correpondants à la table définit dans le fichier .fields du model en question
`)
  .version(package.version)
  //.argument('<string>', 'string to split')
  .option('-s --src <srcPath>', 'le dossier source')
  .option('-d, --dest <destPath>', 'le dossier destination', ',')
  //.option('-i, --include <includeStr>', `la liste des chemins relatifs des fichiers ou dossiers à inclure`, '*')
  .option('-f, --filter <filterStr>', `la liste des models à ignorer, chaine de caractère séparée par des virgules`, '')
  .option('-e, --exclude <excludeStr>', `la liste des chemins relatifs des fichiers ou sous dossiers du dossier [model] à exclure lors de la copie`, '')
  .option('-n, --no-overwrite <noOverwrite>', `la liste des chemins relatifs des fichiers ou sous dossiers du dossier [model] qui ne seront pas remplacés(overwrite)`, '')
  
  .action((str, options) => {
    const opts = {...Object.assign({},str),...Object.assign({},options.opts())};
    callback = typeof callback =='function'? callback : x=>x;
    const {src,dest,srcPath,destPath,filter,out} = opts;
    const s = getArgPath([src,srcPath]);
    const d = getArgPath([dest,destPath,out]);
    if(!s || !fs.lstatSync(s).isDirectory() ) {
        return callback({message:'Vous devez spécifier un repertoire source valide'});
    }
    if(!d || !fs.lstatSync(d).isDirectory() ){
        return callback({message:'Vous devez specifier un repertire destination valide'});
    }
    parseTable(s,d,{},opts).then((p)=>{
        callback(false,p);
    }).catch((e)=>{
        console.log(e, " was parsingg")
    });
});
const pp = path.join(__dirname,"..","src","database","schema","DataTypes","jsTypes");
const models = require(pp);
const parseTable = (srcPath,destPath,paths,params)=>{
    let {filter,include,exclude,noOverwrite} = params;
    srcPath = srcPath && path.resolve(srcPath) || '';
    destPath = destPath && path.resolve(destPath) ||'';
    noOverwrite = noOverwrite && typeof noOverwrite =='string'? noOverwrite.split(",") : [];
    if(typeof filter =='string'){
        const ff = filter.trim().split(",");
        filter = (tableName)=>{
            tableName = tableName.trim().toUpperCase();
            for(let i in ff){
                const tb = ff[i];
                if(tb.trim().toUpperCase() === tableName) return false;
            }
            return true;
        }
    } else {
        filter = typeof filter =='function'? filter : x=>true;
    }
    //include = typeof include =='string' && include ? include.trim().split(",") : [];
    exclude = typeof exclude =='string' && exclude ? exclude.trim().split(",") : [];
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
                const allowedFiles = [];
                let destinationPath = null;
                const generatedFiles = [];
                files.forEach(function (file, index) {
                    // Make one pass and make the file complete
                    const fromPath = path.join(srcPath, file);
                    try {
                        const stat = fs.statSync(fromPath);
                        const isFile = stat.isFile(), isDirectory = stat.isDirectory();
                        if(isFile || isDirectory){
                            allowedFiles.push(file);
                        }
                        if (isFile){
                            const ext = path.extname(fromPath)?.toLowerCase();
                            if(file.toLowerCase().includes("fields") && (ext =='.js' || ext =='.ts')){
                                const tbName = path.basename(path.dirname(fromPath));
                                const tableName = tbName?.toUpperCase();
                                allowedFiles.pop();
                                ///ajout des filtre
                                if(!tableName || !filter(tbName)) return;
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
                                            jsContent = replaceAll(jsContent,st,"'"+mm.js+"'");
                                        }
                                        jsContent = jsContent
                                            .replace(new RegExp(/(length)(\s)*:/,'g'),"maxLength : ")
                                            .replace(new RegExp(/(primary)(\s)*:/,'g'),"primaryKey : ")
                                            .replace(new RegExp(/(name)(\s)*:/, 'g'),"databaseName : ")
                                    }
                                    if(hasFound){
                                        try {
                                            const dPath = destinationPath = path.join(destPath,tableName);
                                            const tablePath = path.join(dPath,"table.js");
                                            const indexPath = path.join(dPath,"index.js");
                                            const srcI18nPath = path.join(srcPath,"i18n.js");
                                            const destI18nPath = path.join(dPath,"i18n.js");
                                            const typesPath = path.join(dPath,"types.js");
                                            
                                            generatedFiles.push(path.join(srcPath,'entity.js'));
                                            generatedFiles.push(path.join(srcPath,'entity.ts'));
                                            generatedFiles.push(path.join(srcPath,'types.js'));
                                            generatedFiles.push(path.join(srcPath,'types.ts'));
                                            generatedFiles.push(path.join(srcPath,'table.js'));
                                            generatedFiles.push(path.join(srcPath,'table.ts'));
                                            generatedFiles.push(path.join(srcPath,'index.js'));
                                            generatedFiles.push(path.join(srcPath,'index.ts'));
                                            generatedFiles.push(path.join(srcPath,'i18n.js'));
                                            generatedFiles.push(path.join(srcPath,'i18n.ts'));
                                            
                                            
                                            writeFile(path.join(dPath,file),jsContent);
                                            if(fs.existsSync(path.join(srcPath,"types.js"))){
                                                writeFile(typesPath,fs.readFileSync(path.join(srcPath,"types.js"))?.toString());
                                            }
                                            ///on crèe le fichier table name
                                            writeFile(tablePath,"export default \""+tableName+"\";");
                                            
                                            if(!fs.existsSync(indexPath)){
                                                const indexStr = "export default \n{\n\ttableName : require('./table').default,\n\tfields : require('./"+replaceAll(file,ext,"")+"').default,\n}";
                                                writeFile(indexPath,indexStr);
                                            }
                                            if(fs.existsSync(srcI18nPath)){
                                                writeFile(destI18nPath,fs.readFileSync(srcI18nPath)?.toString())
                                            }
                                            paths[srcPath]= dPath;
                                            console.log("******************** ",tableName, " is generated")
                                        } catch(e){
                                            console.log(e," is eeeeeeee");
                                        }
                                    }
                                } catch(e){
                                    console.log(e," parsing model",fromPath);
                                    //reject({message:'Error on lokking for file '+fromPath,error:e})
                                }
                            }
                        } else if (isDirectory){
                            //console.log("parsing '%s' directory", fromPath);
                            promises.push(parseTable(fromPath,destPath,paths,params));
                        }
                    } catch(error){
                        console.error("Error stating file.", error);
                        return;
                    }
                });
                if(destinationPath){
                    const toExclude = [];
                    exclude.map((file)=>{
                        file = file.trim();
                        if(!file) return false;
                        toExclude.push(path.resolve(srcPath,file));
                        toExclude.push(path.resolve(destinationPath,file));
                    });
                    const noOver = noOverwrite.map((file)=>{
                        file = file.trim();
                        if(!file) return false;
                        noOver.push(path.resolve(srcPath,file));
                        noOver.push(path.resolve(destinationPath,file));
                    })
                    allowedFiles.map((file)=>{
                        const from = path.join(srcPath,file);
                        if(generatedFiles.includes(from)) return false;
                        const to = path.join(destinationPath,file);
                        try {   
                            fsExtra.copySync(from,to,{
                                ...params,
                                overwrite : noOver.length ? !noOver.includes(from) && noOver.includes(to) : true,
                                filter : (srcPath,destPath)=>{
                                   if(!srcPath || !destPath) return false;
                                   if(toExclude.length && (toExclude.includes(srcPath) || toExclude.includes(destPath))) return false;
                                   return true;
                                }
                            })
                        }catch{}
                    });
                }
                return Promise.all(promises).then(resolve).catch(reject).finally(()=>{
                    let i18nstr= "import i18n from '$i18n';";
                    let rootPath = null;
                    const getTableBuilder = new StringBuilder();
                    const getAccordionPropsBuilder = new StringBuilder();
                    const tablePermsBuilder = new StringBuilder();
                    let hasTables = false,hasAccordionProps = false,hasPerms = false;
                    
                    for(let srcPath in paths){
                        const destPath = paths[srcPath];
                        if(fs.existsSync(destPath)){
                            const i18nP = path.join(destPath,"i18n.js");
                            const tableName = path.basename(destPath);
                            rootPath = rootPath || path.resolve(path.join(destPath,".."));
                            const ctBuilder = new StringBuilder();
                            ctBuilder.appendLine("import {isNonNullString} from '$cutils';\nexport default (tableName)=>{");
                            ctBuilder.appendLine("\tif(!isNonNullString(tableName)) return null;");
                            ctBuilder.appendLine("\ttableName = tableName.toUpperCase().trim();");
                            ctBuilder.appendLine("\tswitch(tableName){");
                            const defaultBuilderStr = ctBuilder.toString();
                            if (!hasTables)
                            {
                                hasTables = true;
                                getTableBuilder.appendLine(defaultBuilderStr);
                            }
                            getTableBuilder.appendLine("\t\tcase {0}:{try{ return require('./{1}').default;} catch{return null;}}".sprintf(tableName.escapeDoubleQuotes(), tableName));
                            
                            const accordionExist = fs.existsSync(path.join(srcPath, "accordion.js"));
                            const accordionPropsExist = fs.existsSync(path.join(srcPath, "accordionProps.js"));
                            const permsExist = fs.existsSync(path.join(srcPath, "perms.js"));
                            if(fs.existsSync(i18nP)){
                                i18nstr+="\n";
                                i18nstr+="i18n.dictionary(require('./"+tableName+"/i18n').default);"
                            }
                            if(accordionExist || accordionPropsExist)
                            {
                                if (!hasAccordionProps)
                                {
                                    hasAccordionProps = true;
                                    getAccordionPropsBuilder.appendLine(defaultBuilderStr);
                                }
                                getAccordionPropsBuilder.appendLine("\t\tcase {0}: return {".sprintf(tableName.escapeDoubleQuotes(), tableName));
                                if (accordionExist)
                                {
                                    getAccordionPropsBuilder.appendLine("\t\t\t{0}:require('./{1}/accordion').default,".sprintf("accordion".escapeDoubleQuotes(),tableName));
                                    if(!fs.existsSync(path.join(destPath,"accordion.js"))){
                                        writeFile(path.join(destPath,"accordion.js"),fs.readFileSync(path.join(srcPath, "accordion.js")).toString())
                                    }
                                }
                                if (accordionPropsExist)
                                {
                                    if(!fs.existsSync(path.join(destPath,"accordionProps.js"))){
                                        writeFile(path.join(destPath,"accordionProps.js"),fs.readFileSync(path.join(srcPath, "accordionProps.js")).toString())
                                    }
                                    getAccordionPropsBuilder.appendLine("\t\t\t{0}:require('./{1}/accordionProps').default,".sprintf("accordionProps".escapeDoubleQuotes(), tableName));
                                }
                                ///on ferme la clause du case
                                getAccordionPropsBuilder.appendLine("\t\t};");
                            }
                            if(permsExist){
                                if (!hasPerms)
                                {
                                    hasPerms = true;
                                    tablePermsBuilder.appendLine("export default {");
                                }
                                tablePermsBuilder.appendLine("\t{0}:require('./{1}/perms').default,".sprintf("perms".escapeDoubleQuotes(),tableName));
                                writeFile(path.join(destPath,"perms.js"),fs.readFileSync(path.join(srcPath, "perms.js")).toString())
                            }
                        }
                    }
                    if(fs.existsSync(rootPath)){
                        if (hasTables)
                        {
                            ///on ferme la clause switch
                            getTableBuilder.appendLine("\t}\n\treturn null;");
                            ///on ferme la clause d'ouverture de la fonction
                            getTableBuilder.appendLine("}");
                            writeFile(path.join(rootPath, "getTable.js"), getTableBuilder.toString());
                        }
                        if (hasAccordionProps)
                        {
                            ///on ferme la clause switch
                            getAccordionPropsBuilder.appendLine("\t}");
                            getAccordionPropsBuilder.appendLine("\treturn undefined;");
                            ///on ferme la clause d'ouverture de la fonction
                            getAccordionPropsBuilder.appendLine("}");
                            writeFile(path.join(rootPath, "getAccordionProps.js"), getAccordionPropsBuilder.toString());
                        }
                        if (hasPerms)
                        {
                            tablePermsBuilder.appendLine("}");
                            writeFile(path.join(rootPath, "perms.js"), tablePermsBuilder.toString());
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
const replaceAll = function(str,find, replace) {
    return str.split(find).join(replace)
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
String.prototype.escapeDoubleQuotes = function(){
    return "\""+this.toString()+"\"";
}
String.prototype.sprintf = function ()
{
    const args = Array.prototype.slice.call(arguments,0);
    let str = this.toString();
    if (!str) return "";
    args.map((s,index)=>{
        if(typeof s !='string'){
            if(s === null) s = "";
            s = s?.toString() || '';
        }
        const replace = s || '';
        str = str.replace("{" + index + "}", replace);
    });
    return str;
}


program.parse(process.argv);