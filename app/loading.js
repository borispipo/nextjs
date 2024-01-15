"use client"
import {Box,CircularProgress} from "$chakra";
import appConfig from "$capp/config";

export default function LoadingProgress ({}){
    return null;
    return <Box display="flex" alignItems="center" justifyContent="center" h="100vh" w="100%" className="loading-progress-container">
        <Box className="logo-content-container">
            <Box className="app-name">
                {appConfig.name}
            </Box>
            <Box style={{marginTop:20}} className="circular-progress">
                <CircularProgress isIndeterminate color={"secondary"} />
            </Box>
            <Box as="span" mt="10px" fontWeight="bold" color="secondary" >version {appConfig.version}</Box>
        </Box>
    </Box>
}