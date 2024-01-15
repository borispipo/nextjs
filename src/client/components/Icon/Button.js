"use client";
import React from "$react";
import {withStyles} from "$theme";
import {IconButton} from "$ui";
import {uniqid,defaultStr} from "$cutils";
import Icon from "./Icon";
import PropTypes from "prop-types";

/****
 * @see : https://chakra-ui.com/docs/components/icon-button
 */
function IconButtonComponent({isActive,isDisabled,isLoading,round,isRound,spinner,icon,name,containerProps,buttonProps,iconProps,...props}){
    const ariaLabel = React.useRef(defaultStr(props["aria-label"],uniqid("icon-button"))).current;
    iconProps = Object.assign({},iconProps);
    buttonProps = Object.assign({},buttonProps);
    return <IconButton
        aria-label = {ariaLabel}
        isActive = {isActive}
        isDisabled = {isDisabled}
        isLoading = {isLoading}
        isRound = {typeof isRound =="boolean"? isRound : typeof round =='boolean'? round : false}
        spinner = {spinner}
        {...buttonProps}
        icon = {React.isValidElement(icon)? icon : <Icon 
            icon = {icon}
            name = {name}
            {...props}
            {...iconProps}
        />}
    />
}
const buttonProps = Object.assign({},IconButton.propTypes);
IconButtonComponent.propTypes = {
    ...buttonProps,
    round : PropTypes.bool,//if icon button is rounded
    containerProps : PropTypes.shape(buttonProps), //props of IconButtonProps : @see : 
    iconProps : PropTypes.shape(Object.assign({},Icon.propTypes))
}
/***
 * @see : https://chakra-ui.com/docs/components/icon-button/props
 */

export default withStyles(IconButtonComponent,{
    variant : "solid",
    className : "icon-button",
    displayName : "IconButtonComponent"
});