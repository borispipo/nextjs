"use client"
import {classNames} from "$utils";

export const useGetContainerProps = ({withContainer,className,...props})=>{
    return {
        maxW: withContainer ? 'unset' : '6xl',
        ml: withContainer ? 'unset' : "auto",
        mr: withContainer ? 'unset' : "auto",
        px: withContainer ? 'unset' : { base: "16px", md: "24px", xl: "0"},
        ...props,
        className : classNames(className,"container-component")
    };
}