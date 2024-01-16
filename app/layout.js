'use client'
import { Providers } from './providers';
import PropTypes from "prop-types";
import {updateTheme,defaultTheme} from "$theme";
import {extendTheme, CSSReset,} from '@chakra-ui/react'
import {useMemo} from "react";
import {classNames} from "$cutils";
import { fonts } from './fonts';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

export default function RootLayout({children,htmlProps,bodyProps,...rest}) {
  "use client"
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
    <html suppressHydrationWarning lang='en'  {...htmlProps} className={classNames(fonts.rubik.variable,htmlProps.className)}>
      <body {...bodyProps} className={classNames(bodyProps.className,"main-body")} suppressHydrationWarning={true}>
        <CSSReset/>
        <Providers theme={theme} {...rest}>{children}</Providers>
        <ToastContainer />
      </body>
    </html>
  )
}

RootLayout.propTypes = {
  htmlProps : PropTypes.object,//les props à passer au tag html
  bodyProps : PropTypes.object,//les props à psser au tag body
}
