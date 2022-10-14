const appConfig = require("$app/config");
appConfig.currrent = require("../config");

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
