"use client"
import React from "$react";

const SidebarContext = React.createContext(null);

export const SidebarProvider = ({children,...props})=>{
    return <SidebarContext.Provider value={props}>
        {children}
    </SidebarContext.Provider>
}

export const useSidebar = ()=>React.useContext(SidebarContext);