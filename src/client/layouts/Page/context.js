import React from "$react";

const PageContext = React.createContext(null);

export const PageProvider = ({children,...props})=>{
    return <PageContext.Provider value={props}>
        {children}
    </PageContext.Provider>
}

export const usePage = x=>React.useContext(PageContext);