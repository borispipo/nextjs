import { CircularProgress, CircularProgressLabel } from '$ui';
import React from '$react';
import PropTypes from "prop-types";

/***
 * @see : https://chakra-ui.com/docs/components/circular-progress
 * @see : https://chakra-ui.com/docs/components/circular-progress/props for proptypes
 */
const CircularProgressComponent = React.forwardRef(({label,withLabel,labelProps,min,max,value,isIndeterminate,...props},ref)=>{
    const [stateValue,setStateValue] = React.useState(isIndeterminate? undefined : value);
    const hasValue = typeof stateValue =="number";
    max = hasValue ? (typeof max =='number' ? max : 100) : undefined;
    min = hasValue ? (typeof min =="number"? min : 0) : undefined
    const renderedValue = hasValue ? (stateValue > max ? max : stateValue < min ? min : stateValue) : undefined;
    const updateValue = (newVal,isInt)=>{
        if(typeof newVal !='number') return;
        if(newVal === stateValue) return;
        newVal = isInt ? undefined : newVal;
        setStateValue(newVal);
    }
    React.useEffect(()=>{
        updateValue(value,isIndeterminate);
    },[value,isIndeterminate,min,max]);
    const labelContent = withLabel !== false ? (typeof label =='function' ? label (renderedValue) : hasValue && `${renderedValue}%` || null) : null; 
    labelProps = Object.assign({},labelProps);
    return <CircularProgress {...props} min={min} max={max} value={renderedValue} isIndeterminate={isIndeterminate}
        ref = {(el)=>{
            if(el){
                el.update = (value)=>updateValue(value);
            }
            React.setRef(ref,el);
        }}
    >
        {labelContent && <CircularProgressLabel {...labelProps}>{labelContent}</CircularProgressLabel>}
    </CircularProgress>
});

CircularProgressComponent.propTypes = {
    ...Object.assign({},CircularProgress.propTypes),
    withLabel : PropTypes.bool,//if false, 
    labelProps : PropTypes.shape({
        ...Object.assign({},CircularProgressLabel.propTypes),
    }),
    label : PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.func,
    ]),
}

CircularProgressComponent.displayName = "CircularProgressComponent";

export default CircularProgressComponent;