// Copyright (c) 2022 @fto-consult/Boris Fouomene
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
const path = require("path");
const fs = require("fs");
const withFonts = require('next-fonts');
const withImages = require('next-images');
const dir = path.resolve(__dirname);
const package = require(path.resolve(dir,"package.json"));
const requestHeaders = require("./request.headers");
const {extendObj} = require("@fto-consult/node-utils");
module.exports = (opts)=>{
  opts = typeof opts =='object' && opts ? opts : {};
  const projectRoot = path.resolve(process.cwd());
  const databaseConfPath = path.resolve(projectRoot,"database.config.js");
  const localDatabaseConfPath = path.resolve(__dirname,"database.config");
  const transpileModules = Array.isArray(opts.transpileModules)? opts.transpileModules : [];
  const modToToTranspiles = ["@fto-consult/common",...transpileModules]
  if(projectRoot !== dir && fs.existsSync(path.resolve(projectRoot,"node_modules",package.name))){
      modToToTranspiles.unshift(package.name);
  }
  const base = typeof opts.projectRoot =="string" && fs.existsSync(path.resolve(opts.projectRoot)) ? path.resolve(opts.projectRoot) : projectRoot;
  const assets = fs.existsSync(path.resolve(base,"public"))? path.resolve(base,"public") : fs.existsSync(path.resolve(projectRoot,"public")) ? path.resolve(projectRoot,"public") : undefined;
  const alias = require("@fto-consult/common/babel.config.alias")({assets,...opts,platform:"web",projectRoot:base});
  const src = alias.$src;
  const public = path.resolve(projectRoot,"public");
  const nextRoot = require("./next-path")();
  const next = path.resolve(nextRoot,"src");
  alias.$nroot = alias["$nroot-path"] = nextRoot;
  alias["$nproviders"] = path.resolve(next,"auth","providers");
  alias["$providers"] = alias["$providers"] || path.resolve(alias["$nproviders"],"list");
  alias["$nauth"] = path.resolve(next,"auth");
  alias["$nmiddlewares"] = path.resolve(next,"middlewares");
  alias["$middlewares"] = alias["$middlewares"] || alias["$nmiddlewares"];
  alias["$nmiddleware"] = path.resolve(next,"middleware");
  alias["$middleware"] = alias["$middleware"] || path.resolve(next,"middleware");
  alias["$ndatabase"] = path.resolve(next,"database");
  alias["$npages"] = alias["$pages"] = path.resolve(dir,"pages");
  alias.$napp = alias.$app = path.resolve(dir,"app");
  alias.$public = alias.$public || public;
  alias.$nevents = path.resolve(next,"events");
  alias.$events = alias.$events || alias.$nevents;
  alias.$nutils = path.resolve(__dirname,"src","utils");
  alias.$npm2 = path.resolve(nextRoot,"pm2");
  alias.$pm2 = alias.$pm2 || alias.$npm2;
  const database = path.resolve(next,'database');
  alias["$nmodels"] = path.resolve(database,"models");
  alias["$BaseModel"] = path.resolve(database,"models","Base");
  alias["$baseModel"] = alias["$BaseModel"];
  alias["$nschema"] = path.resolve(database,"schema");
  alias["$nentities"] = path.resolve(database,"entities")

  alias["$models"] =  alias["$models"] || path.resolve(src,"database","models");
  alias["$entities"] = alias["$entities"] || path.resolve(alias["$models"],"entities");
  alias["$schema"] = alias["$schema"] ||  alias["$nschema"];

  alias["$ndataTypes"] = path.resolve(alias["$nschema"],"DataTypes");
  alias["$dataTypes"] = alias["$dataTypes"] || alias["$ndataTypes"];

  alias["$ndataSources"] = path.resolve(database,"dataSources");
  alias["$dataSources"] = alias["$dataSources"] || alias["$ndataSources"];
  alias["$next-root-path"] = path.resolve(next,"..");
  alias["$next"] = next;
  alias["$withMiddleware"] = alias["$withMiddleware"] || path.resolve(next,"middleware","withMiddleware");
  alias["$cors"] = alias["$cors"] || path.resolve(next,"cors");
  alias["$withCors"] = path.resolve(next,"cors","withCors");
  alias["$nrequestHandler"] = alias["$napiRequestHandler"] = path.resolve(next,"requestHandler");
  alias["$requestHandler"] = alias["$requestHandler"] || alias["$nrequestHandler"];
  alias["$apiRequestHandler"] = alias["$apiRequestHandler"] || alias["$nrequestHandler"];
  alias["$nauth-cookies"] = path.resolve(next,"auth","utils","auth-cookies");
  alias["$nauth-utils"] = path.resolve(next,"auth","utils");
  alias["$auth-cookies"] = alias["$auth-cookies"] || path.resolve(next,"auth","utils","$auth-cookies");
  /**** pour étendre la fonction utils de auth */
  alias["$auth-utils"] = alias["$auth-utils"] || path.resolve(next,"auth","utils","$auth-utils");
  alias["$chakra-next"] = alias["$chakra-ui-next"] = "@chakra-ui/next-js";
  alias["$chakra-ui"] = alias.$ui = alias["$chakra"] = "@chakra-ui/react";
  alias.$nlogger = path.resolve(next,"logger");
  alias.$logger = alias.$logger || alias.$nlogger;
  
  const client = alias.$nclient = path.resolve(next,"client");
  alias.$ncomponents = path.resolve(client,"components");
  alias.$components = alias.$components || alias.$ncomponents;
  alias.$nhooks = path.resolve(client,"hooks");
  alias.$nlayouts = path.resolve(client,"layouts");
  alias["$database-config"] = alias["$database.config"] = alias["$database.config.js"] = fs.existsSync(databaseConfPath)? databaseConfPath : localDatabaseConfPath;
  for(let i in alias){
    if(!alias[i]){
      delete alias[i];//delete all empty alias
    }
  }
  ["transpileModules","base","projectRoot","alias","src","platform"].map((v)=>delete opts[v]);
  const {rewrites,eslint,headers:optsHeaders,webpack:nWebpack,extensions:cExtensions,transpilePackages,compiler:cCompiler,...nRest} = opts;
  const compiler = Object.assign({},cCompiler);
  require("@fto-consult/common/bin/generate-jsonconfig")({...opts,alias});
  const nextConfig = {
    reactStrictMode: true,
    swcMinify: false,
    basePath: '',
    swcMinify: true,
    ...nRest,
    compiler: {
      // Enables the styled-components SWC transform
      ...compiler,
      styledComponents: {
        ssr : true,
        cssProp : true,
        ...Object.assign({},compiler.styledComponents) 
      },
    },
    transpilePackages : [...(Array.isArray(transpilePackages)?transpilePackages:[]),...modToToTranspiles],
    //reactStrictMode: true,
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true,
      ...Object.assign({},eslint)
    },
    async rewrites() {
      const rewriteUrl = process.env.API_REWRITE_URL;
      const ret = [];
      if(isValidURL(rewriteUrl)){
          rewriteUrl = rtrim(rewriteUrl,"/");
          rewriteUrl = rtrim(rewriteUrl,":");
          ret.push({
            source: '/api/:path*',
            destination: rewriteUrl+'/:path*',
          });
      }
      if(typeof rewrites =='function'){
         const r = await rewrites(ret);
         if(Array.isArray(r) || ret && typeof ret =="object"){
            return r;
         }
      }
      return ret;
    },
    ///cors in vercel app
    async headers() {
      const headers = [];
      for(let i in requestHeaders){
        const header = requestHeaders[i];
        if(typeof header =='object' && header && header.isHeader !== false){
          headers.push({
            key : header.key,
            value : header.value,
          });
        }
      }
      let r2 = [];
      if(typeof optsHeaders =='function'){
          r2 = await optsHeaders({headers});
      }
      return [
        ...(Array.isArray(r2)?r2 : []),
        {
          // matching all API routes
          "source": "/api/(.*)",
          headers,
        }
      ]
    },
    webpack: (config,options,...rest) => {
      const { isServer, buildId, dev, defaultLoaders, nextRuntime, webpack } = options;
      if(!isServer){
        alias.$nnotify = path.resolve(client,"notify");
        alias.$notify = alias.$notify !== alias.$cnotify && alias.$notify || alias.$nnotify;
      }
      const ccEx = typeof cExtensions ==="function"? cExtensions({config,...options,options}) : cExtensions;
      const confExtensions = Array.isArray(config.resolve.extensions) ? config.resolve.extensions : [];
      const extensions = config.resolve.extensions = Array.isArray(ccEx)? [...ccEx,...confExtensions] : [...confExtensions];
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        ...alias,
      };
      ///les extensions côté serveur portent l'extensions .server, ceux côté web portent .web, côté platforme react native portent l'extension de la plateforme en question
      const ext =  !isServer ? ".client":".server";
      const defaultExts = [".js", ".jsx",".ts",".tsx",".mjs",".mts"];
      /**** les ficheirs à exécuter côté client porteront toujours l'extension .client.js, ceux côtés serveur porterons l'extension .server.js */
      defaultExts.map((ex)=>{
        const nExt =  `.${ext}${ex}`;
        if(!extensions.includes(nExt)){
          extensions.unshift(nExt);
        }
        const nExt2 =  `.node${ex}`;
        if(isServer && !extensions.includes(nExt2)){
          extensions.unshift(nExt2);
        }
      });
      defaultExts.map(e=>{
        if(!extensions.includes(e)){
          extensions.push(e);
        }
      });
      if(!isServer){
        config.resolve.fallback.fs = config.resolve.fallback.net = config.resolve.fallback.path = config.resolve.fallback.os = false;
        config.externals = [...config.externals,'pg', 'sqlite3', 'tedious', 'pg-hstore','react-native-sqlite-storage'];
      }
      config.plugins.push(require("@fto-consult/common/circular-dependencies"));
      if(typeof nWebpack =='function'){
        nWebpack(config,options,...rest);
      }
      return config;
    },
  }
  return withImages(withFonts(nextConfig));
}

const rtrim = function(current,str) {
  if(typeof current !=="string") return "";
  if (!(str) || typeof str !=="string") {
      return current.trim();
  }
  var index = current.length;
  while(current.endsWith(str) && index >= 0) {
      current = current.slice(0,- str.length);
      --index;
  }
  return current.toString();
}

function isValidURL(string) {
  if(!string || typeof string !='string') return false;
  var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  return (res !== null)
};