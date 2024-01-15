"use client";
import React from "$react";
import PropTypes from "prop-types";
import {flattenStyle} from "$theme";
import {chakra,shouldForwardProp,Box} from "$ui";
import { motion, isValidMotionProp } from 'framer-motion'

const BoxComponent = React.forwardRef(({flex,withContainer,flexWrap,style,...props},ref)=>{
    const hostRef = React.useRef(null);
    React.useEffect(()=>{
        React.setRef(ref,hostRef.current);
    });
    if(Array.isArray(style)){
        style = flattenStyle(style);
    }
    const rProps = flex || flexWrap ? {
        display : "flex",
        flexDirection : "row",
        justifyContent :"start",
        alignItems : "center",
    }:{};
    if(flexWrap){
        rProps.flexWrap = typeof flexWrap ==="boolean"? "wrap":flexWrap;
    }
    return <Box {...rProps} {...props} style={style} ref={hostRef}/>
});

BoxComponent.propTypes = {
    ...Object.assign({},Box.propTypes),
    flex :PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.string,
        PropTypes.object,
    ]) ,
    flexWrap : PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.string,
        PropTypes.object,
    ]),
};

BoxComponent.displayName = "BoxComponent";

export const Animated = chakra(motion.div, {
    shouldForwardProp: p=>isValidMotionProp(p) || shouldForwardProp(p),
});

Animated.propTypes = {
    ...BoxComponent.propTypes,
    ...Object.assign({},motion?.div.propTypes)
};
Animated.displayName = "AnimatedBoxComponent";

BoxComponent.Animated= Animated;
export default BoxComponent;