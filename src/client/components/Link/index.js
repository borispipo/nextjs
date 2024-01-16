"use client"
import { isValidUrl,defaultStr} from "$cutils";
import React from "$react";
import { Link } from '@chakra-ui/next-js'
import {withStyles} from "$theme";
import Button from "$ncomponents/Button";

/***
 * @see : https://chakra-ui.com/docs/components/link/usage
 * @see : https://reactrouter.com/en/main/components/link
 */
const LinkComponent = React.forwardRef(({url,href,to,icon,isExternal,disabled,...props},ref)=>{
  url = isValidUrl(href) ? href : isValidUrl(url)? url : isValidUrl(to)? to : defaultStr(href,url,to);
  const isLocalRoute = (url.startsWith("/") || url.startsWith("#"));
  if(!isValidUrl(url) && !isLocalRoute){
    url = undefined;
  }
  if(isLocalRoute && url){
    isExternal = false;
  } 
  if(!url){
      return <Button {...props}/>
  }
  return <Link {...props} isExternal={isExternal} href={url} ref={ref}/>
});

LinkComponent.propTypes = {
  ...Object.assign({},CharkraLink.propTypes),
  ...Object.assign({},Link.propTypes),
}

export default withStyles(LinkComponent,{
  className :"link",
  variant : "link",
  displayName : "LinkComponent"
})