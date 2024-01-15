'use client'
import { Providers } from './providers';
import PropTypes from "prop-types";
import {updateTheme,defaultTheme} from "$theme";
import {extendTheme, CSSReset,} from '@chakra-ui/react'
import {useMemo} from "react";

export default function RootLayout({children,htmlProps,bodyProps,...rest}) {
  const theme = useMemo(()=>{
    return extendTheme(updateTheme(defaultTheme));
  },[]);
  return (
    <html lang='en' {...Object.assign({},htmlProps)}>
      <body {...Object.assign({},bodyProps)}>
        <CSSReset/>
        <Providers theme={theme} {...rest}>{children}</Providers>
      </body>
    </html>
  )
}

RootLayout.propTypes = {
  htmlProps : PropTypes.object,//les props à passer au tag html
  bodyProps : PropTypes.object,//les props à psser au tag body
}
