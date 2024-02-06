import logger,{logLevels} from "./logger";

export * from "./logger";

const Logger =  {};
logLevels.map((log)=>{
    if(typeof Logger[log] !=="function"){
        Logger[log] = (...errors)=>{
            return logger(log,...errors);
        }
    }
});
export default Logger;