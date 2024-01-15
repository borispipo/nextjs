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
        const pp = path.resolve(projectRoot,"nextjs");
        const mainP = require("./package.json");
        if(fs.existsSync(path.resolve(pp,"package.json"))){
            try {
                const package = require(`${path.resolve(pp,"package.json")}`);
                if(package?.name === mainP.name){
                    p = pp;
                }
            } catch{}
        }
    }
    const sep = path.sep;
    if(p && fs.existsSync(p)){
        return suffix ? path.resolve(p,suffix).replace(sep,(sep+sep)) : p;
    }
    return suffix ? path.join("@fto-consult/nextjs",suffix).replace(sep,"/"):"@fto-consult/nextjs";
};

