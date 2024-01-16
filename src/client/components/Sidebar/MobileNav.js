"use client"
import {Flex} from "$ui";
import Icon from "$ncomponents/Icon";
import Box from "$ncomponents/Box";
import {classNames,defaultObj} from "$utils";
import React from "$react";
import PropTypes from "prop-types";

const MobileNav = ({ onOpen,isOpen,onClose,label,iconProps,icon,children, ...rest }) => {
    iconProps = defaultObj(iconProps);
    children = children === null ? children : React.isValidElement(children)? children : <>
        <Icon
            size = "27px"
            p="0"
            m="0"
            icon={icon || "HamburgerIcon"}
            {...iconProps}
        />
        {React.isValidElement(label,true) && label}
    </>
    return children === null ? null : (<Box position="relative" className="homepage-mobile-nav-container">
            <Flex
                ml={"0"}
                alignItems="center"
                bg={"surface"}
                py="10px"
                px="10px"
                minH="50px"
                position = {"relative"}
                bottom = "auto"
                borderBottomWidth="0"
                justifyContent="flex-start"
                onClick = {onOpen}
                {...rest}
                className = {classNames(rest.className,"cursor-pointer sidebar-mobile-nav")}
            >
                {children}
            </Flex>
        </Box>);
};

MobileNav.propTypes = {
    ...Object.assign({},Flex.propTypes),
    icon : Icon.propTypes.icon,
    children : PropTypes.oneOfType([
        PropTypes.node,
    ]),
    label : PropTypes.node,
}

export default MobileNav;