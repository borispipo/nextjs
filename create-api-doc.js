// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
///@see : https://apidocjs.com/
const path = require("path");
const { createDoc } = require('apidoc');
const fs = require("fs");
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

function generateDocs(options){
    console.log(argv," is argv heinn")
    options = options && typeof options =='object'? options : {};
    const src = options.src && typeof options.src =='string' && fs.existsSync(options.src)? options.src : path.resolve(__dirname, 'pages/api');
    const dest = options.dest && typeof options.dest =='string'? options.dest : path.resolve(__dirname,"docs");
    const docs = createDoc({
        ...options,
        src,
        dest, // can be omitted if dryRun is true
        // if you don't want to generate the output files:
        //dryRun: true,
        // if you don't want to see any log output:
        //silent: true,
    })
    return docs;
}

module.exports = generateDocs();
