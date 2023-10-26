const appConfig = require("$capp/config");
import {AuthProvider} from "$cauth";
import {isObj} from "$utils";
import { getProvider } from "./providers";

export const isMasterAdmin = (user)=>{
    if(!isObj(user)) return false;
    const provider = getProvider(user.providerId);
    if(!isObj(provider)) return false;
    if(typeof provider.isMasterAdmin =="function") return provider.isMasterAdmin(user);
    return user.isMasterAdmin ? true : false;
}

function MyApp({ Component,config, pageProps }) {
  config = typeof config =='object' && config ? config : {};
  appConfig.current = config;
  return <AuthProvider isMasterAdmin={isMasterAdmin}>
    <Component {...pageProps} />
  </AuthProvider>
}

export default MyApp
