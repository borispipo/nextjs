// Copyright (c) 2022 @fto-consult/Boris Fouomene
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
const path = require("path");
const withFonts = require('next-fonts');
const withImages = require('next-images');
const dir = path.resolve(__dirname);
const package = require(path.resolve(dir,"package.json"));
const requestHeaders = require("./request.headers");
module.exports = (opts)=>{
  opts = typeof opts =='object' && opts ? opts : {};
  const transpileModules = Array.isArray(opts.transpileModules)? opts.transpileModules : [];
  const base = opts.base || path.resolve(__dirname);
  const withTM = require('next-transpile-modules')([
    "@fto-consult/common",
    package.name,
    ...transpileModules,
  ]);
  const alias = require("@fto-consult/common/babel.config.alias")({...opts,platform:"web",assets:path.resolve(base,"assets"),base});
  const src = alias.$src;
  const next = require("./lookup-next-path")()?path.resolve(src,"..","nextjs","src") : path.resolve(dir,"src");
  alias["$nproviders"] = path.resolve(next,"auth","providers");
  alias["$providers"] = alias["$providers"] || alias["$nproviders"];
  alias["$nauth"] = path.resolve(next,"auth");
  alias["$nmiddlewares"] = path.resolve(next,"middlewares");
  alias["$middlewares"] = alias["$middlewares"] || alias["$nmiddlewares"];
  alias["$nmiddleware"] = path.resolve(next,"middleware");
  alias["$middleware"] = alias["$middleware"] || path.resolve(next,"middleware");
  alias["$ndatabase"] = path.resolve(next,"database");
  alias["$npages"] = path.resolve(dir,"pages");
  alias["$pages"] = path.resolve(src,"pages");
  alias["$next-connect"] = path.resolve(next,"next-connect");
  
  const database = path.resolve(next,'database');

  alias["$nmodels"] = path.resolve(database,"models");
  alias["$BaseModel"] = path.resolve(database,"models","Base");
  alias["$baseModel"] = alias["$BaseModel"];
  alias["$nschema"] = path.resolve(database,"schema");
  alias["$nentities"] = path.resolve(database,"entities")

  alias["$models"] =  alias["$models"] || path.resolve(src,"database","models");
  alias["$entities"] = path.resolve(alias["$models"],"entities");
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

  const nextConfig = {
    reactStrictMode: true,
    swcMinify: false,
    basePath: '',
    //reactStrictMode: true,
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true,
    },
    swcMinify: true,
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
      return [
        {
          // matching all API routes
          "source": "/api/(.*)",
          headers,
        }
      ]
    },
    webpack: (config,options) => {
      const { isServer, buildId, dev, defaultLoaders, nextRuntime, webpack } = options;
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        ...alias,
      };
      ///les extensions côté serveur portent l'extensions .server, ceux côté web portent .web, côté platforme react native portent l'extension de la plateforme en question
      const ext =  !isServer ? ".client":".server";
      const defaultExts = [".js",".ts",".tsx",".jsx"];
      const sideExtensions =  defaultExts.map(t=>{
        return ext+t;
    });
      /**** les ficheirs à exécuter côté client porteront toujours l'extension .client.js, ceux côtés serveur porterons l'extension .server.js */
      config.resolve.extensions = [
        ...sideExtensions,
        ".web.js",
        ".web.ts",
        ".web.tsx",
        ".web.jsx",
        ...defaultExts,
        ".ts",
      ];
      if(!isServer){
        config.resolve.fallback.fs = config.resolve.fallback.net = config.resolve.fallback.path = config.resolve.fallback.os = false;
        config.externals = [...config.externals,'pg', 'sqlite3', 'tedious', 'pg-hstore','react-native-sqlite-storage'];
      }
      config.plugins.push(require("@fto-consult/common/circular-dependencies"));
      return config;
    },
  }
  return withImages(withTM(withFonts(nextConfig)));
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