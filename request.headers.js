// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

module.exports =  {
    credentials : {
        key : "Access-Control-Allow-Credentials",
        value : "true",
        corsValue : true,
    },
    origin : {
        key : "Access-Control-Allow-Origin",
        value : "*",
        corsValue : true,
    },
    methods : {
        key : "Access-Control-Allow-Methods",
        value : "GET,HEAD,PUT,OPTIONS,PATCH,POST,DELETE",
    },
    allowedHeaders  : {
        key : "Access-Control-Allow-Headers",
        value :"Authorization, Origin, Access-Control-Request-Method,X-Access-Token, Access-Control-Request-Headers, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
    },
    optionsSuccessStatus: {
        isHeader : false,
        value : 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    },
    /*preflightContinue : {
        isHeader : false,
        key : "preflightContinue",
        value : true,
    }*/
}