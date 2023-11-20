import appConfig from "$capp/config";

function MyApp({ Component,config, pageProps }) {
  config = typeof config =='object' && config ? config : {};
  appConfig.current = config;
  return <Component {...pageProps} />
}

export default MyApp
