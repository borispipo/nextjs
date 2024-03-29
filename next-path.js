// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const fs = require("fs");
const path = require("path");
///retourne le chemin vers le package @nextjs
module.exports = function (...args){
    const suffix = path.join(...args);
    const projectRoot = path.resolve(process.cwd()), dir = path.resolve(__dirname);
    let p = projectRoot === dir ? projectRoot : null;
    if(!p){
        try {
            const mP = path.resolve(projectRoot,"package.json");
            if(fs.existsSync(mP)){
                const mpp = JSON.parse(fs.readFileSync(mP));
                if(mpp?.name =="@fto-consult/nextjs"){
                    p = projectRoot;
                }
            }
        } catch{}
        if(!p){
            try {
                const pp = path.resolve(projectRoot,"nextjs");
                const mainP = JSON.parse(fs.readFileSync("./package.json"));
                if(fs.existsSync(path.resolve(pp,"package.json"))){
                    try {
                        const packageM = JSON.parse(fs.readFileSync(path.resolve(pp,"package.json")));
                        if(packageM?.name === mainP.name){
                            p = pp;
                        }
                    } catch{}
                }
            } catch{}
        }
    }
    const sep = path.sep;
    if(p && fs.existsSync(p)){
        return suffix ? path.resolve(p,suffix).replace(sep,(sep+sep)) : p;
    }
    const root = path.resolve(projectRoot,"node_modules","@fto-consult/nextjs")
    return suffix ? path.join(root,suffix).replace(sep,"/"):root;
};

