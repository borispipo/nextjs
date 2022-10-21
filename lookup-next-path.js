// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
const fs = require("fs");
const path = require("path");
const dir = path.resolve(__dirname)
module.exports = function lookupNextjsPath (){
    let level = 4; //jusqu'à 4 niveaux
    let nextjsPath= null;
    let rootPath = path.resolve(dir);
    while(level>0 && !nextjsPath){
        const p = path.resolve(rootPath,"nextjs");
        const nPath = path.resolve(rootPath,"node_modules");
        const srcPath = path.resolve(rootPath,"src");
        const nextPath = path.resolve(rootPath,"next.config.js");
        if(fs.existsSync(p) && fs.existsSync(nPath) && fs.existsSync(srcPath) && fs.existsSync(nextPath)){
            nextjsPath = p;
            return nextjsPath;
        }
        rootPath = path.resolve(rootPath,"..");
        level = level-1;
    }
    return nextjsPath;
}