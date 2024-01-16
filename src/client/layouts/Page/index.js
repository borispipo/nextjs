"use client"
import Page from "./Page";
import { PageProvider } from "./context";
import React from "$react";
import { useBreakpointValue } from "$ui";
import Dimensions from "$dimensions";
import {addClassName,removeClassName} from "$cutils/dom";
import {isTouchDevice} from "$cutils";

export default function PageLayout(props){
    ///for responsive sidebar navigation
    const {isMobile,isDesktop}= useBreakpointValue({
        base : {isMobile:true},
        lg : {isDesktop:true}
    })// : {};
    const isTablet = Dimensions.isTabletMedia();
    //for the nav bar minimization handle
    const [isSidebarMinimized,setIsSidebarMinimized] = React.useState(false);
    React.useEffect(()=>{
        removeClassName(document.body,"not-touch-device touch-device");
        addClassName(document.body,!isTouchDevice()?"not-touch-device":"touch-device");
    },[]);
    const toggleSidebarMinimize = (e)=>{
        setIsSidebarMinimized(!isSidebarMinimized)
    };
    return <PageProvider isSidebarMinimized={isSidebarMinimized} toggleSidebarMinimize={toggleSidebarMinimize} isTablet={isTablet} isMobile={isMobile} isDesktop={isDesktop}>
        <Page {...props}/>
    </PageProvider>
}

PageLayout.prototypes = Page.propTypes;

export * from "./context";
