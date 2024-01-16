"use client"
import React from "$react";
import Box from "$ncomponents/Box";
import {classNames} from "$cutils";
import {Drawer,DrawerContent,DrawerOverlay,useDisclosure} from "$ui";
import MobileNav from "./MobileNav";
import Sidebar from "./Sidebar";
import PropTypes from "prop-types";
import { SidebarProvider } from "./context";
import {uniqid,defaultStr} from "$cutils";

export * from "./utils";
export * from "./context";

export default function SidebarComponent({isMobile,getItemId,renderItem,isItemActive,getItemClassName,id,position,minimizable,mobileNavProps,mobileProps,desktopProps,minimized,toggleMinimizeIcon,placement,isDesktop,...props}){
    const { isOpen, onOpen, onClose } = useDisclosure();
    const idRef = React.useRef(defaultStr(id,uniqid("box-sidebar-id")));
    minimized = minimizable === false ? false : isMobile ? false : minimized;
    isItemActive = typeof isItemActive =='function'? isItemActive : x=>false;
    getItemId = typeof getItemId =='function'? getItemId : ({item})=> item;
    placement = placement || "left";
    mobileNavProps = Object.assign({},mobileNavProps);
    mobileProps = Object.assign({},mobileProps);
    desktopProps = Object.assign({},desktopProps);
    toggleMinimizeIcon = React.isValidElement(toggleMinimizeIcon)? toggleMinimizeIcon : null;
    const content =  <Sidebar
        {...props}
        mobileProps = {mobileProps}
        id = {idRef.current}
    />
    return <SidebarProvider {...props} id={idRef.current} {...{placement,renderItem,isItemActive,
        getItemClassName:(...a)=>{
            if(typeof getItemClassName ==='function'){
                return classNames(getItemClassName(...a));
            }
            return "";
        },
        getItemId,minimizable,isMobile,isDesktop,minimized,toggleMinimizeIcon,isOpen,onOpen,onClose}}>{!isMobile ? content : <Box {...mobileProps} bg="transparent" w="100%" className={classNames(mobileProps.className,"sidebar-mobile-container")}>
        {<MobileNav {...mobileNavProps} onOpen={onOpen} isOpen={isOpen} onClose={onClose} />}
        <Drawer
            autoFocus={false}
            isOpen={isOpen}
            placement={placement}
            onClose={onClose}
            returnFocusOnClose={false}
            onOverlayClick={onClose}
            size="full"
            className = {classNames("homepage-sidebar-container")}
        >
            <DrawerOverlay/>
            <DrawerContent className="homepage-sidebar-content-wrapper" w={"100%"} maxW="360px">
                {content}
            </DrawerContent>
        </Drawer>
    </Box>
    }</SidebarProvider>
}

SidebarComponent.propTypes =  {
    ...Object.assign({},Sidebar.propTypes),
    getItemId : PropTypes.func,
    mobileProps : PropTypes.shape({
        //le heade à afficher en environnement mobile
        header : PropTypes.oneOfType([
            PropTypes.node,
            PropTypes.string,
         ]),
    }),
    getItemClassName : PropTypes.func,
    isMobile : PropTypes.bool,//if device has mobile size
    isDesktop : PropTypes.bool,//if device has deskop size 
    toggleMinimizeIcon : PropTypes.node,
}