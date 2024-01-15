"use client";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import React from "$react";
import {getMaxZindex} from "$utils/dom";
import PropTypes from "prop-types";
import { TIPPY_THEME } from '$theme/updateNative/utils';
import {isDOMElement} from "$utils/dom";
import {uniqid} from "$utils";
import Box from "$ncomponents/Box";
import { classNames } from '$cutils';

const TippyTooltipComponent  = React.forwardRef(({children,tooltip,title,...rest},ref)=>{
    const instanceIdRef = React.useRef(uniqid("tippy-instance-id")); 
    const buttonRef = React.useRef(null);
    const innerRef = React.useMergeRefs(ref,buttonRef);
    const selector = "#"+instanceIdRef.current;
    let content= React.isValidElement(tooltip,true) && tooltip || title;
    if(!content || rest.disabled === true || rest.readOnly === true || rest.isDisabled === true){
        return children;
    }
    React.useEffect(()=>{
        content = React.getTextContent(content);
        if(typeof content =='string'){
            content = content.replaceAll("\n","<br/>");
        }
        if(!content) return;
        const tpI = tippy(isDOMElement(buttonRef.current)? buttonRef.current:selector,{
            content,
            allowHTML : true,
            theme : TIPPY_THEME,
            onShow : (instance)=>{
                if(instance && typeof(instance.setProps) ==="function"){
                    instance.setProps({
                        zIndex:getMaxZindex()
                    })
                }
            }
        });
        const instance = Array.isArray(tpI) ? tpI[0] : tpI;
        return ()=>{
            React.setRef(ref,null);
            if(instance && instance.destroy){
                instance.destroy();
            }
        }
    },[content])
    const cProps = {
        ...rest,
        id:instanceIdRef.current,
    }
    React.useEffect(()=>{
        React.setRef(ref,innerRef);
    });
    if(typeof children =='function'){
        return children(cProps,innerRef);
    }
    return  <Box {...cProps} className={classNames(cProps.className,"tooltip")} ref={innerRef}>
        {children}
    </Box>
});
TippyTooltipComponent.propTypes = {
    content: PropTypes.any, //le contenu du tooltip
    title : PropTypes.string, //le contenu du tooltip
}

export default TippyTooltipComponent;