import { getFilePath } from './utils';
import { stringify } from "$cutils/stringify";
import DateLib from "$clib/date";
const fs = require('fs');

export const logLevels = ["info","debug","log","warning","warn","error","prod"];
const isDev = String(process.env.NODE_ENV).toLowerCase().trim() !== 'production';
export const defaultSupportedLevels = isDev ? logLevels : ["error","warning","prod"];
///la variable d'environnement LOGS_LEVELS : {exemple:prod,error,warning}, permet de spécifier les logs qui seront prise en compte durant l'exécution de l'application
let supportedLevels = process.env.LOGS_LEVELS && typeof process.env.LOGS_LEVELS =="string" ? String(process.env.LOGS_LEVELS).trim() : null;
if(supportedLevels){
    supportedLevels = supportedLevels.split(",").filter((s,i)=>{
        if(!s){
            return false;
        }
        return logLevels.includes(s.toLowerCase().trim());
    }).map((s)=>s.toLowerCase().trim());
    if(!supportedLevels.length){
        supportedLevels = defaultSupportedLevels;
    }
} else supportedLevels = defaultSupportedLevels;

/***************************************************************************
 * @param {string} logLevel - Log level [prod|info|warning|warn|error|debug]
 * @param {Array<any>} errors
 **************************************************************************/
export default function logger(logLevel,...errors) {
    let level = typeof logLevel =="string" && logLevels.includes(logLevel.toLowerCase())? logLevel.toLowerCase() : "info";
    if(level.toLowerCase() ==="warning"){
        level = "warn";
    }
    // Log messages based on log-level
    // If logLevel is prod or prod-trace then dont log debug/trace messages
    if(!isDev && String(level).toLowerCase() === 'prod') {
        return;
    }
    if(!logLevels.includes(level)){
        level = "info";
    }
    if(!supportedLevels.includes(level)) return; ///log level is not suppported so we have to exit
    const logInfo = level.charAt(0).toUpperCase() + level.slice(1);
    const fileName = getFilePath();
    const currentTime = DateLib.format(new Date(),"ddd dd mmm yyyy à HH:MM:SS");
    const logInConsole = x => console.log(logInfo,currentTime,...errors);;
    if(!fileName || (isDev && !process.env.LOGS_IN_CONSOLE)){
        ///file is not writable or environnement is 
        logInConsole();
        return true;
    }
    try {
        const errorText = `******************************* ${currentTime} | [${logInfo}] ********************************\n`+errors.map((error)=>{
            return  `${stringify(error)}\n`
        }).join("\n\t")+"\n\n";
        fs.appendFileSync(fileName, errorText);
    } catch(e){
        console.log(e," ****** error on logging");
        logInConsole();
        return false;
    }
}