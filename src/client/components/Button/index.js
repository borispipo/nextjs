"use client"
import {Button} from "$ui";
import {withStyles} from "$theme";
import PropTypes from "prop-types";
import {classNames,isNonNullString} from "$utils";
import Icon from "$ncomponents/Icon";
import React from "$react";

const ButtonComponent = React.forwardRef(({left:cLeft,opacity,pointerEvents,disabled,isDisabled,leftIcon,children,loadingText,leftIconProps,rightIconProps,rightIcon,right:cRight,className,color,bgColor,...props},ref)=>{
    const lrProps = {color,bgColor,className};
    const left = typeof cLeft =="function" && cLeft({...lrProps,className:"btn-left"}) || cLeft;
    const right = typeof cRight ==="function" && cRight({...lrProps,className:"btn-right"}) || cRight;
    leftIcon = typeof leftIcon =='function' && leftIcon({...lrProps,className:"btn-left-icon"}) || leftIcon;
    leftIconProps = Object.assign({},leftIconProps);
    rightIconProps = Object.assign({},rightIconProps);
    rightIcon = typeof rightIcon =='function' && rightIcon({...lrProps,className:"btn-right-icon"}) || rightIcon;
    leftIcon = isNonNullString(leftIcon)? <Icon name={leftIcon} {...lrProps} {...leftIconProps} className={classNames(leftIconProps.className,"btn-left-icon")}/> : React.isValidElement(leftIcon) && leftIcon || null;
    rightIcon = isNonNullString(rightIcon)? <Icon name={rightIcon} {...lrProps} {...rightIconProps} className={classNames(rightIconProps.className,"btn-right-icon")}/> : React.isValidElement(rightIcon) && rightIcon || null;
    isDisabled = !!(isDisabled||disabled);
    
    return <Button 
        {...props} 
        leftIcon = {leftIcon}
        rightIcon = {rightIcon}
        color={color} 
        bgColor={bgColor} 
        className={classNames(className,"btn",isDisabled ?"disabled":"")}
        ref = {ref}
        loadingText = {loadingText || React.getTextContent(children)}
        isDisabled= {isDisabled}
        pointerEvents = {isDisabled?"none":pointerEvents}
        opacity = {isDisabled?0.3:opacity}
    >
        {left && left || null}
        {children}
        {right && right || null}
    </Button>
})
const leftOrRightType = PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
    PropTypes.element
])
ButtonComponent.propTypes = {
    ...Object.assign({},Button.propTypes),
    contentProps : PropTypes.object,
    /**** button left action */
    left : leftOrRightType,
    //button right action
    right : leftOrRightType,
    leftIcon : leftOrRightType,
    rightIcon : leftOrRightType,
    leftIconProps : PropTypes.object,
    rightIconProps : PropTypes.object,

}
export default withStyles(ButtonComponent,{displayName:'ButtonComponent',variant:'solid'});