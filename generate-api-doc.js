// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
///@see : https://apidocjs.com/
///@see-also : https://speakerdeck.com/rottmann/api-documentation
const path = require("path");
const { createDoc } = require('apidoc');
const fs = require("fs");
const sanitize = require("sanitize-filename")

module.exports = function generateApiDocs(options){
    options = options && typeof options =='object'? options : {};
    const dir = path.resolve(__dirname);
    const base = typeof options.base =='string' && options.base && fs.existsSync(options.base)? options.base : null;
    let src = Array.isArray(options.src)? options.src : options.src && typeof options.src =='string' && fs.existsSync(options.src)? options.src : base ? path.resolve(src,"pages","api") : path.resolve(__dirname, 'pages/api');
    const dest = options.dest && typeof options.dest =='string'? options.dest : path.resolve(__dirname,"api-docs");
    let packageJSON = options.package && typeof options.package =='string' && fs.existsSync(options.package)?options.package : null;
    if(!packageJSON && base && fs.existsSync(path.resolve(base,"package.json"))){
        packageJSON = path.resolve(base,"package.json");
    }
    if(!packageJSON && fs.existsSync(path.resolve(dir,"package.json"))){
        packageJSON = path.resolve(dir,"package.json");
    }
    let configPath = "";
    if(packageJSON){
        try {
            const json = JSON.parse(fs.readFileSync(packageJSON));
            const desc = json.description || json.name;
            let configContent = {
                name : json.name,
                description : json.description,
                version : json.version,
                title : (json.title || (desc+" | API Documentation")),
            };
            if(typeof json.apidoc =='object' && json.apidoc){
                configContent = {
                    url : "/api",
                    ...configContent,
                    ...json.apidoc,
                }
            }
            ///@see : https://apidocjs.com/#param-api-define
            configContent.template = typeof configContent.template =='object' && configContent.template ? configContent.template :{};
            configContent.template = {
                forceLanguage : "fr",
                ...configContent.template
            }
            configContent.header = typeof configContent.header =='object' && configContent.header ?configContent.header : {};
            configContent.header = {
                title : "Introduction",
                ...configContent.header,
            }
            configContent.footer = typeof configContent.footer =='object' && configContent.footer ? configContent.footer : {};
            configContent.footer = {
                title : "Pied de page",
                ...configContent.footer
            }
            if(base){
                const apiDocBase = path.resolve(base,"api-doc");
                ///par défaut, le contenu du message d'introduction doit être situé dans le repertoire /api-doc/header.md
                if(!configContent.header.filename && fs.existsSync(path.resolve(apiDocBase,"header.md"))){
                    configContent.header.filename = path.resolve(apiDocBase,"header.md");
                }
                ///par défaut le chemind u fichier md à utiliser comme contenu du footer dans l'api généré sera le fichier /api-doc/footer.md
                if(!configContent.footer.filename && fs.existsSync(path.resolve(apiDocBase,"footer.md"))){
                    configContent.footer.filename = path.resolve(apiDocBase,"footer.md");
                }
            }
            if(!configContent.header.filename){
                configContent.header.filename = path.resolve(dir,"api-doc","header.md");
            }
            if(!configContent.footer.filename){
                configContent.footer.filename = path.resolve(dir,"api-doc","footer.md");
            }
            const fileName = sanitize(configContent.name +"-api-doc.json");
            const p = path.resolve(dir,fileName);
            fs.writeFileSync(p,JSON.stringify(configContent));
            if(fs.existsSync){
                configPath = p;
            }
            console.log(configContent," is conf content")
        } catch{}
    }
    if(src && !Array.isArray(src)){
        src = [src];
    }
    //console.log("***** generating api doc : ",src.join(","), " => ",dest);
    const docs = createDoc({
        ...options,
        src,
        dest, // can be omitted if dryRun is true
        // if you don't want to generate the output files:
        //dryRun: true,
        // if you don't want to see any log output:
        //silent: true,
        config : configPath,
    })
    if(fs.existsSync(configPath)){
        
    }
    return docs;
}
