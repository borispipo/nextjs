"use client"
import React from "$react";
import Box from "$ncomponents/Box";
import Container from "$ncomponents/Container";
import PropTypes from "prop-types";
import {defaultObj,defaultStr,classNames} from "$cutils";
import {addClassName,removeClassName} from "$cutils/dom";
import {chakra,shouldForwardProp} from "$ui";
import { motion, isValidMotionProp } from 'framer-motion';
import Sidebar,{sidebarPositions,sidebarRightPosition,sidebarLeftPosition}  from "$ncomponents/Sidebar";
import Icon from "$ncomponents/Icon";
import {defaultTitle,defaultDescription} from "./utils";
import { usePage } from "./context";
import AuthContainer from "$cauth/Container";


export default function PageLayout({header,animate,breadcrumb,children2SidebarContainerProps,sidebar,withSidebar,renderSidebarNextToContent,sidebarPosition,title,description,sidebarProps,breadcrumbProps,headerProps,children:pageChildren,withContainer,contentContainerProps,contentProps,footer,footerProps,authProps, authRequired,...props}){
    const {toggleSidebarMinimize,isDesktop,isMobile,isSidebarMinimized,isTablet} = usePage();
    headerProps = defaultObj(headerProps);
    footerProps = defaultObj(footerProps);
    contentProps = defaultObj(contentProps);
    breadcrumbProps = defaultObj(breadcrumbProps);
    sidebarProps = defaultObj(sidebarProps);
    contentContainerProps = defaultObj(contentContainerProps);
    children2SidebarContainerProps = defaultObj(children2SidebarContainerProps);
    authProps = defaultObj(authProps);
    breadcrumb = breadcrumb === null? breadcrumb : React.isValidElement(breadcrumb)? breadcrumb : null;
    const HeaderComponent = React.isComponent(header)? header : null;
    title = defaultStr(title,defaultTitle); 
    description = defaultStr(description,defaultDescription).trim();
    sidebarProps.position = defaultStr(sidebarProps.position,sidebarLeftPosition).toLowerCase();
    if(!sidebarPositions.includes(sidebarProps.position)){
        sidebarProps.position = sidebarLeftPosition;
    }
    const sidebarOnTheRight = sidebarProps.position == sidebarRightPosition;
    const innerRef = React.useRef(null);
    const SidebarComponent = React.isComponent(sidebar)? sidebar : Sidebar;
    if(SidebarComponent !== Sidebar || React.isValidElement(sidebar) && typeof withSidebar !=="boolean"){
        withSidebar = true;
    }
    header = header === null? null : React.isValidElement(header)? header : HeaderComponent && <HeaderComponent
        {...headerProps}
        isSidebarMinimized = {withSidebar && isSidebarMinimized || false}
        isMobile = {isMobile}
        isDesktop = {isDesktop}
        withSidebar = {withSidebar}
        className = {classNames(headerProps.className,"main-header")}
    /> || null;
    const FooterComponent = React.isComponent(footer)? footer : null;
    footer = footer === null? null : React.isValidElement(footer)? footer : FooterComponent && <FooterComponent
        {...footerProps}
        className = {classNames(footerProps.className,"main-footer")}
    /> || null;
    const renderDesktopSidebar = isDesktop && withSidebar;
    const Component = withContainer && !withSidebar ? Container : Box;
    const sidebarContent = withSidebar ? React.isValidElement(sidebar)? sidebar :  <SidebarComponent 
        minimized = {isSidebarMinimized}
        toggleMinimizeIcon = {isMobile ? null : <Icon size="30px" icon={!isSidebarMinimized?"material-MdArrowBackIosNew":"material-MdArrowForwardIos"}  title={isSidebarMinimized?"Restore sidebar":"Minimize sidebar"} onClick={toggleSidebarMinimize} color="primary" />}
        {...sidebarProps} 
        isMobile={isMobile} 
        position = {sidebarOnTheRight?"right":"left"}
        isDesktop={isDesktop}
        isHeaderRendered = {!!header}
    /> : null;
    const children = React.useStableMemo(()=>{
        if(!renderSidebarNextToContent || !renderDesktopSidebar) return pageChildren;
        return <Box h="100%" w="100%" flex justifyContent="center" alignItems="start" {...children2SidebarContainerProps} className={classNames("page-children-container",children2SidebarContainerProps.className)} >
            {!sidebarOnTheRight && sidebarContent}
            {pageChildren}
            {sidebarOnTheRight && sidebarContent}
        </Box>
    },[pageChildren,isSidebarMinimized,renderDesktopSidebar,renderSidebarNextToContent])
    React.useEffect(()=>{
        document.title = title;
        const descElement = document.getElementsByTagName('meta')["description"];
        if(descElement){
            descElement.content = description;
        }
    },[title,description])
    const animationProps = animate !== false ? {
        initial : "initial",
        animate : "in",
        exit : "out",
        
    } : {};
    const transitionClassName = classNames(props.className,"main-page",isMobile && "mobile",isTablet && "tablet", isDesktop && "desktop",withSidebar ? "with-sidebar":"with-not-sidebar");
    const prevClassName = React.usePrevious(transitionClassName);
    React.useEffect(()=>{
        removeClassName(innerRef.current,prevClassName);
        addClassName(innerRef.current,transitionClassName);
    },[transitionClassName]);
    return <AuthContainer authRequired={authRequired} {...authProps}>
            <PageLayoutTransition 
                {...animationProps}
                ref = {innerRef}
                bgColor = {"background"}
                w = {"full"}
                h = {"full"}
                overflow = {withSidebar?undefined : "auto"}
                display = {withSidebar && isDesktop? "flex":undefined}
                justifyContent = {withSidebar && isDesktop ? "start":undefined}
                alignItems = {withSidebar && isDesktop ? "start":undefined}
                flexDirection = {withSidebar && isDesktop ? "row":undefined}
                {...props}
                variants={pageVariants}
                className = {"main-page"}
            >
                {renderDesktopSidebar && !renderSidebarNextToContent && !sidebarOnTheRight && sidebarContent}
                <Box h="100%" flexGrow={withSidebar?1:undefined} display={"flex"} flexDirection="column" {...contentContainerProps} className={classNames(contentContainerProps.className,"main-page-wrapper")} >
                    {header && <Box className="main-header-wrapper" w="100%">{header}</Box>}
                    {breadcrumb && <Container className="main-breadcrumb">{breadcrumb}</Container>}
                    {withSidebar && isMobile && sidebarContent}
                    <Component
                        withContainer
                        minH={withSidebar ?(isDesktop?"250px":"100px") : undefined}
                        display="flex"
                        flexDirection="column"
                        {...contentProps} 
                        className={classNames("main-content-wrapper",withContainer&&"with-container",contentProps.className)} 
                        children={children}
                    />
                    {footer && <Box className="main-footer-wrapper" w={"100%"}>{footer}</Box>}
                </Box>
                {renderDesktopSidebar && !renderSidebarNextToContent && sidebarOnTheRight && sidebarContent}
            </PageLayoutTransition>
    </AuthContainer>
}

const elType = PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.elementType,
]);
PageLayout.propTypes = {
    animate : PropTypes.bool,//if page will be animated
    authRequired : PropTypes.bool,//specify if user must be logged in to see the page
    authProps : PropTypes.object, //props to pass throught authContainer component
    header : elType,
    renderSidebarNextToContent : PropTypes.bool,//the sidebar will be rendered on the content side
    footer : elType,
    footerProps : PropTypes.shape({}),
    withContainer : PropTypes.bool, //if container component will use to render main content
    contentProps : PropTypes.object,// content props, props of wrapper to page's children
    breadcrumb : elType,
    breadcrumbProps : PropTypes.object,
    withSidebar : PropTypes.bool,//if render the content with sidebar
    sidebarProps : PropTypes.object,
    title : PropTypes.string, //page title
    description : PropTypes.string, //page description
    children2SidebarContainerProps : PropTypes.object,//the props of box component, wich wrap children en Sidebar content
}

const PageLayoutTransition = chakra(motion.div, {
    shouldForwardProp: p=>isValidMotionProp(p) || shouldForwardProp(p),
});
PageLayoutTransition.displayName = "PageLayoutTransition";

const pageVariants = {
    initial: {
      opacity: 0,
    },
    in: {
      opacity: 1,
    },
    out: {
      opacity: 0,
    },
 }