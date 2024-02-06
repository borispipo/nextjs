/**** @see : https://typeorm.io/logging# */
import { AbstractLogger } from "typeorm";
import logger from "$nlogger";

export default class Logger extends AbstractLogger {
    /**
     * Write log to specific output.
     */
    writeLog(level,logMessage,queryRunner) {
        const messages = this.prepareLogMessages(logMessage, {highlightSql: false});
        const log = (mLevel,message,title)=>{
            return logger[mLevel](`Typeorm LOG ${title && String(title) || ''} [${message.type}] ${message.prefix && message.prefix ||''}`,message.message);
        }
        for (let message of messages) {
            const mLevel  = String(message.type ?? level).toLowerCase().trim();
            if(typeof logger[mLevel] =="function"){
                log(mLevel,message);
            } else switch(mLevel){
                case "query":
                    log("info",message,"Query");
                    break
                case "query-slow":
                    log("warn",message,"Query slow");
                    break
                case "query-error":
                    log("error",message,"Query error ");
                    break
            }
        }
    }
}