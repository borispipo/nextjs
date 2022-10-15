// Copyright (c) 2022 @fto-consult/Boris Fouomene
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
const path = require("path");
const withFonts = require('next-fonts');
const withImages = require('next-images');
const dir = path.resolve(__dirname);
const package = require(path.resolve(dir,"package.json"));
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
  const next = path.resolve(dir,"src");

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

  //alias["$eentities"] = path.resolve(database,"models","entities");
  alias["$emodels"] = path.resolve(database,"models");
  alias["$eschema"] = path.resolve(database,"schema");
  
  alias["$models"] =  path.resolve(src,"database","models");
  alias["$entities"] = path.resolve(alias["$models"],"entities");
  alias["$schema"] = alias["$schema"] ||  alias["$eschema"];

  alias["$edataTypes"] = path.resolve(alias["$eschema"],"DataTypes");
  alias["$dataTypes"] = alias["$dataTypes"] || alias["$edataTypes"];

  alias["$edataSources"] = path.resolve(database,"dataSources");
  alias["$dataSources"] = alias["$dataSources"] || alias["$edataSources"];
  
  
  alias["$next"] = next;
  
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
    ///cors in vercel app
    async headers() {
      return [
        {
          // matching all API routes
          source: "/api/:path*",
          headers: [
            { key: "Access-Control-Allow-Credentials", value: "true" },
            { key: "Access-Control-Allow-Origin", value: "*" },
            { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
            { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
          ]
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
      }
      config.plugins.push(require("./circular-dependencies"));
      
      return config;
    },
  }
  return withImages(withTM(withFonts(nextConfig)));
}
