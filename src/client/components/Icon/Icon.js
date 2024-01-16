"use client"
import React from "$react";
import {defaultStr,isNonNullString,classNames} from "$cutils";
import PropTypes from "prop-types";
import * as ChakraIcons from '@chakra-ui/icons';
//import * as MaterialIcons from "react-icons/md";
//import * as BootstrapIcons from "react-icons/bs"; //Bootstrap Icons
//import * as AntdIcons from "react-icons/ai";
//import * as FontAwesomeIcons from "react-icons/fa";
import theme,{withStyles} from "$theme";
import {Icon as ChakraIcon} from "$ui";
import Tooltip from "$components/Tooltip";

/*** *
 * @see : https://chakra-ui.com/docs/components/icon for all suported icons
 * @see : https://react-icons.github.io/react-icons/icons?name=bs for Bootstrap Icons
 * @see https://react-icons.github.io/react-icons/icons?name=md for material design icon set
 * @see https://react-icons.github.io/react-icons/icons?name=si for simple icons set
 * @see https://react-icons.github.io/react-icons/icons?name=ai for Ant Design icons
 * @see : https://react-icons.github.io/react-icons/icons?name=fa for Font Awesome 5
 * The default iconSet is the Chakra ui icon set,  which does not require prefixing the icon names, you can see on avaliable icons on https://chakra-ui.com/docs/components/icon
 * -The following prefixes must be used: 
 * - material-, for the iconSet Material design
 * - si-, for the iconSet simple -icon
 * - antd- || ai- for ant design icon
 * 
*/
const IconComponent = React.forwardRef(({icon,size,as:asIcon,className,boxSize,name,tooltip,title,...props},ref)=>{
    if(React.isValidElement(icon)) return icon;
    if(React.isValidElement(name)) return name;
    icon = defaultStr(icon,name).trim();
    const isMaterial = isIcon(icon,["material","md"]);
    const isSocial = isIcon(icon,"si");
    const isAntd = isIcon(icon,["antd","ai"]);
    const isBi = isIcon(icon,"bs");
    const isFa = false;//isIcon(icon,"fa");
    let iconName = icon.ltrim("material-") //material-icons
    .ltrim("si-") //simple icon
    .ltrim("antd-") //antd icon
    .ltrim("ai-") //antd icon
    .ltrim("fa-") //Font Awesome 5
    .ltrim("bs-") //BootstrapIcons
    .replaceAll("-","_")
    .toCamelCase()
    .ucFirst().trim();
    let IconSet = ChakraIcons;
    if(false && isMaterial){
        IconSet = {}//("react-icons/md");
        iconName = "Md"+iconName.ltrim("Md");
    } else if(false && isAntd){
        IconSet = //("react-icons/ai")// we remote antd icon set
        iconName = "Ai"+iconName.ltrim("Ai");
    } else if(false && isBi){
        //IconSet = //("react-icons/bs");
        iconName = "Bs"+iconName.ltrim("Bs");
    } else if(false && isFa){
        IconSet = {};//FontAwesomeIcons;
        iconName = "Fa"+iconName.ltrim("Fa");
    }  
    const isChakra = IconSet == ChakraIcons;
    if(isChakra){
        iconName = iconName.rtrim("Icon")+"Icon"
    }
    if(!iconName || !IconSet[iconName]){
        console.warn("Icon not defined for the component IconComponent, icon [{0}] with generated name is {1}, please specify an icon supported by the module list https://chakra-ui.com/docs/components/icon".sprintf(icon,iconName),props);
        return null;
    }
    const Icon = IconSet[iconName];
    asIcon = React.isComponent(asIcon) || React.isValidElement(asIcon,true) && typeof asIcon !=="boolean"? asIcon : null;
    if(!asIcon && !React.isComponent(Icon)){
        console.error(`Invalid icon component `,Icon, " for generated name ",iconName," name is ",name,icon,props);
        return null;
    }
    boxSize = boxSize || size;
    props.cursor = props.cursor || !props.disabled && !props.isDisabled && "pointer";
    const clx = classNames(className,"icon","icon-"+icon,"icon-"+iconName);
    const children = asIcon || isChakra ? <Icon {...props} className={clx} boxSize={boxSize}/> : <ChakraIcon  as = {asIcon||Icon} {...props} className={clx} boxSize={boxSize}/>;
    return <Tooltip lineHeight={"0px"} className={classNames("tooltip-icon","tooltip-icon-"+iconName,"tooltip-icon-"+icon)} ref={ref} title={title} tooltip={tooltip} children={children} />
});

const iconType = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.node,
])
const sizeProp = PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
])
IconComponent.propTypes = {
    ...Object.assign({},ChakraIcon.propTypes),
    name : iconType,
    icon : iconType,
    boxSize : sizeProp,
    size : sizeProp,
}
IconComponent.displayName = "IconComponent";

const DefExport = withStyles(IconComponent,{variant:'ghost',shouldForwardProp:(name)=>{
    return !["bgColor"].includes(name);
},propsMutator:(props)=>{
    delete props.bgColors;
    props.color = props.color && theme.colors[props.color] || props.color;
    return 
}});

/*** check if the icon passed in parameter is an icon for the icon set
 * @param {string} name of the icon to check
 * @param {string} iconSet, the icon set in which to check
 */
export const isIcon = (name,iconSet)=>{
    if(Array.isArray(iconSet)){
        for(let i in iconSet){
            if(isIcon(name,iconSet[i])) return true;
        }
        return false;
    }
    if(!isNonNullString(name) || !isNonNullString(iconSet)) return false;
    return name.toLowerCase().startsWith(iconSet.toLowerCase().trim()+"-") ? true : false;
}

DefExport.propTypes = IconComponent.propTypes;

export default DefExport;