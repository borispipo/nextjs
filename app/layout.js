'use client'
import { Providers } from './providers';
import PropTypes from "prop-types";
import {updateTheme,defaultTheme} from "$theme";
import {extendTheme, CSSReset,} from '@chakra-ui/react'
import {useMemo} from "react";
import {classNames} from "$cutils";
import { fonts } from './fonts'

export default function RootLayout({children,htmlProps,bodyProps,...rest}) {
  const theme = useMemo(()=>{
    return extendTheme(updateTheme({
      ...defaultTheme,
      fonts: {
        heading: 'var(--font-rubik)',
        body: 'var(--font-rubik)',
      }
    }));
  },[]);
  bodyProps = Object.assign({},bodyProps);
  htmlProps = Object.assign({},htmlProps);
  return (
    <html lang='en'  {...htmlProps} className={classNames(fonts.rubik.variable,htmlProps.className)}>
      <body {...bodyProps} className={classNames(bodyProps.className,"main-body")} suppressHydrationWarning>
        <CSSReset/>
        <Providers disableTransitionOnChange theme={theme} {...rest}>{children}</Providers>
      </body>
    </html>
  )
}

RootLayout.propTypes = {
  htmlProps : PropTypes.object,//les props à passer au tag html
  bodyProps : PropTypes.object,//les props à psser au tag body
}
