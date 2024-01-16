"use client"
import Box from "$ncomponents/Box";
import {Flex} from "$ui";
import appConfig from "$capp/config";
import Text from "$ncomponents/Text";
import Icon from "$ncomponents/Icon";
import {classNames,defaultObj,isObj} from "$cutils";
import React from "$react";
import Divider from "$ncomponents/Divider";
import {getMaxZindex} from "$cutils/dom";
import Dimensions  from "$cdimensions";
import theme from "$theme";
import { WIDTH,MINIMIZED_WIDTH } from "./utils";
import PropTypes from "prop-types";
import { useSidebar } from "./context";

export default function SidebarContentComponent({id,footer,items,closeOnClickItem,mobileHeader,mobileProps,isHeaderRendered,onItemClick,closeIconProps,collapsedIconProps,uncollapsedIconProps,itemContainerProps, ...rest}){
    const {isOpen,isDesktop,isMobile,toggleMinimizeIcon,minimizable,minimized,onClose} = useSidebar();
    const width = isMobile && Dimensions.get("window").width || minimized ? MINIMIZED_WIDTH : WIDTH;
    const animateProps = {enter:{},exit:{}};
    if(!isMobile){
      animateProps.enter.width = minimized?MINIMIZED_WIDTH:WIDTH;
      animateProps.exit.width = (minimized ? MINIMIZED_WIDTH : WIDTH);
    }
    const children = React.useStableMemo(()=>{
        items = Array.isArray(items) && items || [];
        return items.map((item,index) => {
            if(!isObj(item)) return null;
            if(Array.isArray(item.items) && item.items.length){
                return <SidebarItemParent
                    items={item.items}
                    itemParentsIds={[]}
                    item={item} 
                    index={index} 
                    key={index} 
                    level = {0}
                />
            }
            return (<SidebarItem index={index} parentItems={items} itemParentsIds={[]} level={0}   item={item} key={index} />)
        });
    },[items,minimized,closeOnClickItem]);
    return (
        <Box.Animated
          bg={"darkGreyBackground"}
          position='relative'
          animate = {isMobile?(isOpen?"enter":"exit"):("enter")}
          initial = {"exit"}
          boxShadow = {"lg"}
          borderRight="1px"
          borderRightColor={"divider"}
          //borderTopColor = "divider"
          borderTopWidth = "0px"
          //borderBottomWidth = "1px"
          borderBottomColor = "divider"
          w={isMobile ? "full" : `${width}px`}
          minW={isMobile?undefined: `${width}px`}
          pos={isMobile?"fixed":"relative"}
          h={isMobile?'full':"100%"}
          top={isHeaderRendered !== false ? {base:"0"} : undefined}
          overflow = "hidden"
          _hover = {{overflow:"auto"}}
          {...rest}
          id = {id}
          className={classNames(rest.className,minimized ? "minimized":"not-minimized","sidebar-content",isMobile?"sidebar-mobile":"sidebar-desktop")}
          pb={isDesktop && isHeaderRendered?`${10}px`:"1rem"}
          zIndex = {isMobile?(isOpen?getMaxZindex()+"":"0"):+"10"}
          variants = {{
            enter: {
              transition: {
                duration: 0.5,
                delay : 0,
              },
              ...animateProps.enter,
            },
            exit: {
              transition: {
                duration: isMobile?5:0.5,
                delay: 0,
              },
              transitionEnd: {
                //display: isMobile  ?  "none" : "block"
              },
              ...animateProps.exit
            }
          }}
        >
          <Flex className="sidebar-header-mobile" display={{ base: 'flex', lg: 'none' }} py="10px" alignItems="center" px="15px" justifyContent="space-between" w="100%">
            {React.isValidElement(mobileProps?.header,true) && mobileProps?.header || <Text primary fontWeight="bold">{appConfig.name}</Text>}
            <Icon size="25px" icon="material-close" {...defaultObj(closeIconProps)} onClick={onClose} />
          </Flex>
          {minimizable && <Box className="home-page-desktop-sidebar-header" display={!isDesktop?"none":"flex"} pb="10px" alignItems="center" px={"10px"} justifyContent={!minimized?"space-between":"center"} w="100%">
            {isDesktop && toggleMinimizeIcon||null}
          </Box>}
          <Divider w='100%' className="sidebar-divider" mb="10px"/>
          {children}
          {React.isValidElement(footer,true) && footer}
        </Box.Animated>
  );
}

const SidebarItemParent = ({children,items,level,itemParentsIds,...args})=>{
    const {isMobile,getItemId,collapsedIconProps,uncollapsedIconProps,getItemClassName,isItemActive,minimized,renderItem} = useSidebar();
    level = typeof level =='number'? level : 0;
    const isActive = isItemActive(args);
    args.isParentActive = isActive;
    args.isActive = isActive;
    level = typeof level =='number'? level : 0;
    args.containerProps = {};
    args.isParent = true;
    args.level = level;
    args.items = items;
    args.parentId = getItemId(args);
    itemParentsIds = Array.isArray(itemParentsIds)? itemParentsIds : [];
    itemParentsIds.push(args.parentId);
    args.itemParentsIds = itemParentsIds;
    const itemClassName = classNames(getItemClassName(args));
    children = renderChildren(renderItem,args);
    if(!React.isValidElement(children,true)) return null;
    const [collapsed,setCollapsed] = React.useState(!isActive);
    React.useEffect(()=>{
      if(isActive && (collapsed)){
        setCollapsed(false);
      }
    },[isActive,itemClassName]);
    const expandedRef = React.useRef(collapsed);
    const content = React.useMemo(()=>{
        if(!expandedRef.current && !isActive) return null;
        return items.map((item,index) => {
          if(!isObj(item)) return null;
          if(Array.isArray(item.items) && item.items.length){
              return <SidebarItemParent
                  items={item.items}
                  item={item} 
                  itemParentsIds={{itemParentsIds}}
                  index={index} 
                  key={index} 
                  level = {level+1}
              />
          }
          return (<SidebarItem parentItems ={items} itemParentsIds={{itemParentsIds}} item={item} index={index} key={index}/>)
      })
    },[items,expandedRef.current,isActive,itemClassName,minimized,isMobile]);
    const onSidebarClick = (e)=>{
        React.stopEventPropagation(e);
        expandedRef.current = true;
        setCollapsed(!collapsed);
    }
    const child = <Box.Animated w="100%" onClick={onSidebarClick} initial="closed" animate={collapsed?"closed":"open"} variants = {sideVariants} className={classNames("sidebar-item-parent cursor-pointer",itemClassName,`${itemClassName}-container`,`${itemClassName}-parent`)}>
      <Box className={classNames("sidebar-item-parent-content-text")} display={'flex'} flexDirection="row" 
        justifyContent="space-between" 
        alignItems="center"
        {...sidebarItemProps}
      >
        <Box className="sidebar-item-parent-children">
          {children}
        </Box>
        {<Box className={classNames("sidebar-item-parent-dropdown-container")}>
            <Icon size={"25px"} name={collapsed ? "TriangleUpIcon" : "TriangleDownIcon"} {...defaultObj(collapsed ? collapsedIconProps : uncollapsedIconProps)}/>
        </Box>}
      </Box>
      {!collapsed && !minimized && <Box pl={"10px"} pr="10px" className={classNames("sidebar-item-parent-collapsed-container")}>
          {content}
      </Box>}
    </Box.Animated>
    return child
}

const sideVariants = {
  closed: {
    transition: {
      staggerChildren: 0.2,
      staggerDirection: -1
    }
  },
  open: {
    transition: {
      staggerChildren: 0.2,
      staggerDirection: 1
    }
  }
};

const sidebarItemProps= {
  px:"7px",py:"7px",my:"7px",mx:"5px"
}

const SidebarItem = ({level, ...args}) => {
    const {onOpen,onClose,isOpen,onItemClick,itemContainerProps,closeOnClickItem,isItemActive,getItemClassName,renderItem,isMobile} = useSidebar();
    const isActive = isItemActive(args);
    args.isActive = isActive;
    level = typeof level =='number'? level : 0;
    args.containerProps = {};
    args.isChildren = false;
    args.level = level;
    const itemClassName = classNames(getItemClassName(args));
    const children = renderChildren(renderItem,args);
    if(!React.isValidElement(children,true)) return null;
    const containerProps = defaultObj(args.containerProps);
    const itContainerProps = defaultObj(typeof itemContainerProps ==='function'? itemContainerProps(args) : itemContainerProps);
    const close= (e)=>isMobile && typeof onClose=="function" && onClose(e),open=e=>isMobile && typeof onOpen ==="function" && onOpen(e);
    const child = <Flex
      align="center"
      justifyContent={!args.minimized && "start" || "center"}
      fontWeight = {isActive ? "bold" : "normal"}
      {...sidebarItemProps}
      borderRadius="lg"
      bg = {getBackgroundColor(isActive)}
      color={isActive ? "primaryText" : "secondaryText"}
      role="group"
      cursor="pointer"
      w="100%"
      _hover={{
        bg: isActive ? undefined : getBackgroundColor(true),
        // color: isActive ? undefined : "primary",
      }}
      {...itContainerProps}
      {...containerProps}
      className = {classNames("sidebar-item",`${itemClassName}`,isActive?'active-item':"inactive-item","sidebar-item-"+args.index,itemContainerProps.className,containerProps.className)}
      onClick = {(event)=>{
        React.stopEventPropagation(event);
        if(closeOnClickItem !== false){
            close();
            if(isMobile){
               setTimeout(()=>{
                if(typeof onItemClick =="function"){
                      onItemClick({...args,close,open,event})
                }
               },300);
            } else {
              if(typeof onItemClick =="function"){
                  onItemClick({...args,close,open,event})
              }
            }
         } else {
          if(typeof onItemClick =="function"){
              onItemClick({...args,close,open,event})
          }
         }
        
      }}
    >
      {children}
    </Flex>;
    return child
  };
  

export const getBackgroundColor = (active)=>{
  return active ? theme.colors.primary : 'transparent';
}

SidebarContentComponent.propTypes = {
   items : PropTypes.array,
   /*** le contenu à afficher au header du sidebar en environnemnet mobile */
   footer : PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.element,
   ]),//sidebar footer
   id : PropTypes.string,//box id
   closeIconProps : PropTypes.object,//prof of close icon
   collapsedIconProps : PropTypes.object, //collapse icon
   uncollapsedIconProps : PropTypes.object,
   isItemActive : PropTypes.func, //({item,index})=>{bool}, //if item is active
   renderItem : PropTypes.func,//({item,index,containerProps{object}})=>React.node, used to render item content
   toggleMinimizeIcon : PropTypes.node,//button to toggle sidebar minimized's state
   minimizable : PropTypes.bool, //if sidebar is minimizable
   onItemClick : PropTypes.func, //onClick on item event handler
   itemContainerProps : PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
   ]),//props of each sidebar items container
   closeOnClickItem : PropTypes.bool,//if sidebar will be closed on mobile device when we click on an item
   isHeaderRendered : PropTypes.bool, //if the header is rendered on page
}

const renderChildren = (Component,args)=>{
  if(React.isComponent(Component)){
    return <Component  {...args}/>
  }
  return typeof Component ==="function" ? Component(args) : null;
} 