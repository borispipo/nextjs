import appConfig from "$capp/config";
import {isObj} from "$cutils";

function MyApp({ Component,config, pageProps }) {
  if(isObj(config) && Object.size(config,true)){
    appConfig.current = config;
  }
  return <Component {...pageProps} />
}

export default MyApp
