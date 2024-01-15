import React from "$react";
import {Divider} from "$ui";
import PropTypes from "prop-types";

export default function DividerComponent({color,size,borderBottomWidth,borderColor,...props}){
    return <Divider
        opacity="1"
        borderColor = {borderColor|| color || undefined}
        borderBottomWidth = {borderBottomWidth || size || undefined}
        {...props}
    />
}

DividerComponent.propTypes = {
    ...Object.assign({},Divider.propTypes),
    color : PropTypes.string,
    borderColor : PropTypes.string,
    size : PropTypes.string,
    borderBottomWidth : PropTypes.string,
}