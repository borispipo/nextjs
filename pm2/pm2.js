const pm2 = require('pm2');
const session = require("./session");
/***@see : https://pm2.keymetrics.io/docs/usage/pm2-api/ */

const connect = (no_daemon_mode, fn)=>{
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
            return resolve(options);
        }
        const args = typeof no_daemon_mode =="boolean"? [no_daemon_mode,connetCB] : [connetCB];
        return pm2.connect(...args);
    });
}
const execPM2 = (method,process,fn)=>{
    return new Promise((resolve,reject)=>{
        return connect().then((meta)=>{
            const callback = (err,...rest)=>{
                if(typeof fn ==="function"){
                    fn(err,...rest);
                }
                if(err){
                    pm2.disconnect();
                    return reject(err);
                }
                return resolve(...rest);
            };
            if(typeof method =="function") return method(callback);
            return pm2[method](process,callback);
        });
    });
}
const start = function(...rest){
    return execPM2("start",...rest);
}
const stop = function(...rest){
    return execPM2("stop",...rest);
}
const list = function(...rest){
    return execPM2("list",...rest);
}
const deletePM2 = (...rest)=>{
    return execPM2("delete",...rest);
}
const restart = (process, options, fn)=>{
    return execPM2(function(cb){
        return pm2.restart(process,options,cb);
    },process,fn);
}

module.exports = {...pm2,...session,restart,connectNative:pm2.connect,connect,start,stop,list,execPM2,delete:deletePM2};