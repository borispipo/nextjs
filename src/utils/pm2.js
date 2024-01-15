const pm2 = require('pm2');
const {extendObj} = require("@fto-consult/node-utils");

/***@see : https://pm2.keymetrics.io/docs/usage/pm2-api/ */
export const connect = (no_daemon_mode, fn)=>{
    if(typeof no_daemon_mode =="function"){
        const b = fn;
        fn = typeof fn =="function"? fn : no_daemon_mode;
        if(typeof b ==='boolean'){
            no_daemon_mode = b;
        }
    }
    return new Promise((resolve,reject)=>{
        const connetCB = (err,options,...rest)=>{
            if(typeof fn ==='function'){
                fn(err,options,...rest);
            }
            if (err) {
                return reject(err);
            }
            return resolve(extendObj({},options,...rest));
        }
        const args = typeof no_daemon_mode =="boolean"? [no_daemon_mode,connetCB] : [connetCB];
        return pm2.connect(...args);
    });
}
const execPM2 = (method,process,fn)=>{
    return new Promise((resolve,reject)=>{
        return connect().then((meta)=>{
            return pm2[method](process,(err,...rest)=>{
                if(typeof fn ==="function"){
                    fn(err,...rest);
                }
                if(err){
                    return reject(err);
                }
                return resolve(...rest);
            });
        });
    });
}
export const start = function(...rest){
    return execPM2("start",...rest);
}
export const stop = function(...rest){
    return execPM2("stop",...rest);
}
export const list = function(...rest){
    return execPM2("list",...rest);
}
export const deletePM2 = (...rest)=>{
    return execPM2("delete",...rest);
}

export default {...pm2,connectNative:pm2.connect,connect,start,stop,list,execPM2,delete:deletePM2};