'use strict';

import DateLib from "$clib/date";
import appConfig from "$capp/config";
const {isPlainObj,createDir,isWritable,FILE,getAppDataPath} = require("@fto-consult/node-utils");
const fs = require("fs");
const path = require('path');

/**** retourne le chemin des fichiers logs 
    par défaut les fichiers logs sont stockés dans le dossier /logs/mois-annee/
*/
export const getFilePath = function() {
    const years = new Date().getFullYear();
    const date = DateLib.format(new Date(),"mm-yyyy");
    const appName = String(FILE.sanitizeFileName(appConfig.name||'')||'').replaceAll("/","-").replace(/\s+/g, '');
    let fPath = process.env.LOGS_FOLDER && typeof process.env.LOGS_FOLDER =="string" ? FILE.sanitize(process.env.LOGS_FOLDER) : null;
    if(!fPath || !isWritable(fPath)){
        try {
            fPath = path.resolve(getAppDataPath(),"logs")
        }catch(e){
            const cwd = process.execPath || process.cwd();
            if(cwd && isWritable(cwd)){
                fPath = path.resolve(cwd,"logs");
            } else {
                console.log(e,"unable to retrieve app data path as log folder");
                return null;
            }
        }
    }
    const folderPath = path.join(fPath,String(years),date);
    const fileName = `${appName ? `${appName}.log.`:""}${DateLib.format(new Date(),"dd-mm-yyyy")}.log`; 
    if(!createDir(folderPath)){
        return null;
    }
    if(!isWritable(folderPath)) return null;
    return path.resolve(folderPath,fileName);
};