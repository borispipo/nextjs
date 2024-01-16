"use client"
import fetch,{put} from "$capi";
import React,{useEffect,useState,useRef,createContext,useContext,useMemo} from "$react";
const rootPath = `pm2`;
import Box from "$ncomponents/Box";
import Button from "$ncomponents/Button";
import {Table,Thead,Tbody,Tfoot,Tr,Th,Td,TableCaption,Accordion,AccordionItem,AccordionButton,AccordionPanel,AccordionIcon,TableContainer} from '$ui'
import {defaultNumber,isObj,extendObj,isNonNullString} from "$cutils";
import CircularProgress from "$ncomponents/CircularProgress";
import Icon from "$ncomponents/Icon";
import useSWR from "$swr";
import Heading from "$ncomponents/Heading";
import appConfig from "$capp/config";
import Page from "$nlayouts/Page";
import { Input } from '@chakra-ui/react'
import notify from "$notify";
import Divider from "$ncomponents/Divider";
import Text from "$ncomponents/Text";

export const useFetchData = (path,options)=>{
    return useSWR(path,extendObj(true,{},{
        refreshInterval : 5000,
        fetcher : (url,options)=>fetch(url,options),
    },options,options?.swrConfig));
}
const getEnv = (rowData)=>{
    if(!isObj(rowData)) return {};
    return Object.assign({},rowData?.pm2_env);
};

export const startInstance = ()=>{
    return fetch(`${rootPath}/instance/start`).then(notify.success).catch(notify.error);
}

export const stopInstance = ()=>{
    return fetch(`${rootPath}/instance/stop`).then(notify.success).catch(notify.error);
}

export const restartInstance = ()=>{
    return fetch(`${rootPath}/instance/restart`).then(notify.success).catch(notify.error);
}
export const deleteInstance = ()=>{
    return fetch(`${rootPath}/instance/delete`).then(notify.success).catch(notify.error);
}



/***@see : https://pm2.keymetrics.io/docs/usage/pm2-api/ */
export default function PM2Page (){
    const {data:cData,isLoading,refresh,...rest} = useFetchData(rootPath);
    const dataRef = useRef([]);
    const data = useMemo(()=>{
        if(isObj(cData) && Array.isArray(cData.data)) {
            dataRef.current = cData.data;
        }
        return dataRef.current;
    },[cData]);
    const getProcess = (name)=>{
        if(isNonNullString(name)){
            for(let i in data){
                const d = data[i];
                if(isObj(d) && d?.name ===name) return d;
            }
        }
        return null;
    }
    return <PM2Context.Provider value={{...rest,getProcess,fetchResult:dataRef.current,processes:data,isLoading,refresh}}>
            <Page 
                withContainer
                renderSidebarNextToContent
                header = {<Heading as="h5" primary fontSize={"1.7rem"} mt="10px" mb="10px" w="100%" textAlign="center">
                    {`${appConfig.name}, Gestionaire de resources`}
                </Heading>}
                sidebar = {SidebarContent}
        >
            <Box w="100%" pl="10px">
                <ListProcesses/>
            </Box>
        </Page>
    </PM2Context.Provider>
}
const SidebarContent = ({isMobile,isDesktop})=>{
    const {data:cData,isLoading,refresh} = useFetchData(`${rootPath}/options`);
    const {getProcess,refresh:refreshInstances} = usePM2();
    const doAction = (method,...rest)=>{
        return method(...rest).then(refreshInstances);
    }
    const dataRef = useRef({});
    const data = useMemo(()=>{
        if(isObj(cData) && isObj(cData.data)) {
            dataRef.current = cData.data;
        }
        if(!isObj(dataRef.current)){
            dataRef.current = {};
        }
        return dataRef.current;
    },[cData?.data]);
    const {currentAppName, apps,...rest} = data;
    const appContent = useMemo(()=>{
        const content = [];
        Object.map(apps,(item,i)=>{
            if(!isObj(item)) return null;
            const updateApp = ()=>{
                apps[i] = item;
                return put(`${rootPath}/options`,{method:"post",body:{currentAppName,...rest,apps}}).then(refresh).catch(notify.error);
            };
            const isActive = i == currentAppName;//|| i == appConfig.name;
            item.name = item.name || i;
            const mProcess = getProcess(item.name);
            content.push(<AccordionItem key={i}>
              <Box as="h2" w="100%" color={isActive?"primary":"text"} fontWeight={isActive?"bold":"normal"}>
                <AccordionButton w="100%" justifyContent="space-between">
                  <Box as="span" flex='1'textAlign='left'>
                    {i}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </Box>
              <AccordionPanel pb={4}>
                  <Accordion >
                    <SettingItem
                        title={"Variables d'environnement"}
                        tooltip = "Veuillez spécifier les variables d'environnement de l'application"
                        content = {<SidebarItemContent
                            item = {item}
                            itemKey = {"env"}
                            editable={isActive}
                            data = {data}
                            onDelete={({code,value})=>{
                                if(isObj(item.env)){
                                    delete item.env[code];
                                }
                                updateApp();
                            }}
                            onValueChange = {({code,value,prevValue})=>{
                                item.env = Object.assign({},item.env);
                                item.env[code] = value;
                                updateApp();
                            }}
                            onAdd={({code,value})=>{
                                item.env = Object.assign({},item.env);
                                item.env[code] = value;
                                updateApp();
                            }}
                        />}
                    />
                  {<AccordionItem>
                        <Box as="h2" w="100%">
                            <AccordionButton w="100%" justifyContent="space-between">
                              <Box as="span" flex='1'textAlign='left'>
                                {"Informations | Actions"}
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                        </Box>
                        <AccordionPanel>
                            <Box w="100%">
                                <Box>
                                    <Status withButton rowData={mProcess}/>
                                </Box>
                                {isActive?<Box w="100%">
                                    <Text fontWeight="bold" p="10px">Actions sur l'instance</Text>
                                    {
                                        [
                                            {children:"Démarrer",color:"success",onClick:()=>doAction(startInstance)},
                                            {children : "Arreter",color:"error",onClick:()=>doAction(stopInstance)},
                                            {children : "Redemarrer",color:"warning",onClick:()=>doAction(restartInstance)},
                                            {children : "Supprimer",color:"error", onClick : ()=>doAction(deleteInstance)}
                                        ].map((a,i)=><Button
                                          key={a.children}
                                          {...a}
                                          m="5px"
                                          
                                        />)
                                    }
                                </Box>:null}
                            </Box>
                        </AccordionPanel>
                    </AccordionItem>}
                  </Accordion>
                </AccordionPanel>
            </AccordionItem>);
        });
        return content;
    },[apps]);
    return <Box className="sidebar-content" w={{base:"100%",lg:"500px"}} borderColor="divider">
        <Box as="h1" textAlign="center" mt="-5px" pb="5px" fontWeight="bold" color="primary">Options</Box>
        <Divider/>
        {isLoading ? <Box display="flex" justifyContent="center" alignItems="center" w="100%">
            <CircularProgress isIndeterminate/>
        </Box>:null}
        <Accordion>
            {appContent}
        </Accordion>
    </Box>
};

const SidebarItemContent = ({item,itemKey,editable,onDelete,onValueChange,inputType,dataType,onAdd})=>{
    const value = item[itemKey];
    const valueRef = useRef("");
    const codeRef = useRef("");
    const codeInputRef = useRef(null),valueInputRef = useRef(null);
    const data = useMemo(()=>{
        const data = [];
        Object.map(value,(v,i)=>{
            if(v === undefined)return;
            data.push({
                code : i,
                value : v,
            })
        });
        return data;
    },[value]);
    return <Box className="sidebar-item-content-wrapper" w="100%">
        {data.map(({code,value})=>{
            return <SidebarContentValue
                key={code}
                code = {code}
                value = {value}
                editable={editable}
                onDelete={onDelete}
                onValueChange={onValueChange}
            />
        })}
        {editable && <Box w="100%" flexDirection="row" justifyContent="start" alignItems="center" className="add-element">
            <Input
                type={"text"}
                name = "code"
                placeholder="Code"
                defaultValue={""}
                ref = {codeInputRef}
                onChange = {(e)=>{
                    codeRef.current = e?.target?.value;
                }}
                mb = "5px"
            />
            <Input
                type={inputType}
                placeholder="Valeur"
                defaultValue={""}
                ref = {valueInputRef}
                onChange = {(e)=>{
                    valueRef.current = e?.target?.value;
                }}
                mb="5px"
            />
            <Button
                leftIcon="check"
                title = {"Cliquez pour enregistrer l'élement"}
                children = {"Ajouter"}
                onClick = {(e)=>{
                    if(!isNonNullString(codeRef.current) || codeRef.current.includes(" ")){
                        notify.error("Veuillez spécifier une valeur non nulle du code et ne contenant pas d'espace");
                        return;
                    }
                    if(!isNonNullString(valueRef.current) || valueRef.current.includes(" ")){
                        notify.error("Veuillez spécifier une valeur non nulle de la valeur et ne contenant pas d'espace");
                        return;
                    }
                    if(typeof onAdd =="function"){
                        const code = codeRef.current, value = valueRef.current;
                        onAdd({code,value});
                        codeRef.current = valueRef.current = "" ;
                        if(valueInputRef.current){
                            valueInputRef.current.value = "";
                        }
                        if(codeInputRef.current){
                            codeInputRef.current.value = "";
                        }
                    }
                }}
            />
        </Box>}
        <Divider w="100%"/>
    </Box>;
}
const SidebarContentValue = ({code,value,inputType,onValueChange,onDelete,editable,item})=>{
    const [isEditable,setIsEditable] = useState(false);
    const valueRef = useRef(React.getTextContent(value));
    const prevEditable = React.usePrevious(isEditable);
    useEffect(()=>{
        if(!editable || prevEditable === isEditable) return;
        if(!isEditable && prevEditable){
            if(typeof onValueChange =="function"){
                onValueChange({code,value:valueRef.current,prevValue:value});
            }
        }
    },[valueRef.current,isEditable]);
    return <Box borderBottomColor="divider" borderBottomWidth="1px" key={code} w="100%" mb="5px" pb="5px" display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center" flexDirection="row">
        <Box flexWrap="wrap" py="5px" justifyContent="start" alignItems="center" flexDirection="row"> 
            <Text>{code} = </Text>
            {isEditable ? <Input type={inputType} onChange={(e)=>valueRef.current=e?.target?.value} defaultValue={valueRef.current}/> : <Box as="span" fontWeight="bold">
                {React.isValidElement(valueRef.current,true) && valueRef.current}
            </Box>}
        </Box>
        {editable && <Box ml="5px" mb="5px" flexWrap="wrap" display="flex" flexDirection="row" alignItems="center">
            <Icon
                name ={isEditable?"check":"EditIcon"}
                title = {isEditable?"Cliquez pour modifier":"Cliquez pour enregistrer la modification"}
                onClick={editable?(e)=>{
                   setIsEditable(!isEditable);
                }:undefined}
                size = {"20px"}
                mr="5px"
                ml="5px"
            />
            <Icon
                name="delete"
                size = {"20px"}
                color="error"
                title = {"Supprimer la valeur ["+valueRef.current+"] de la clé "+code}
                onClick = {(e)=>{
                    if(typeof onDelete =="function"){
                        onDelete({code,label:valueRef.current})
                    }
                }}
            />
        </Box>}
    </Box>
}
const SettingItem = ({title,content})=>{
    return <AccordionItem>
        <Box as="h2" w="100%">
            <AccordionButton w="100%" justifyContent="space-between">
              <Box as="span" flex='1'textAlign='left'>
                {title}
              </Box>
              <AccordionIcon />
            </AccordionButton>
        </Box>
        <AccordionPanel>
            {content}
        </AccordionPanel>
    </AccordionItem>
}
const ListProcesses = ()=>{
    const {processes:data,isLoading} = usePM2();
    const fields = {
        name : {
            label : "Nom du processus",
        },
        pid : {
            type : "number",
            label : "Id du processus",
            render : ({rowData})=>{
                return String(rowData.pid);
            }
        },
        status : {
          label : "Status",
          render : ({rowData})=>{
            return <Status
                rowData={rowData}
            />
          }
        },
        type : {
            label : "Message",
        },
        pm_id : {
            label : "Id | daemon"
        },
        instances  : {
            label : "Nombre d'instances",
            render : ({rowData})=>{
                const {instances } = getEnv(rowData);
                return defaultNumber(instances).formatNumber();
            }
        },
        monit : {
            label : "Monitoring",
            width : "120px",
            render : ({rowData})=>{
                const {memory,cpu} = Object.assign({},rowData.monit);
                return <Box display="flex" w="120px" flexDirection="row" flexWrap="wrap">
                    <Box as="span">
                    <Box as="span" fontWeight="bold">Processeur : </Box>
                        <Box color="primary">{(defaultNumber(cpu)/100).formatNumber()}%</Box>
                    </Box>
                    <Box as="span">
                        <Box as="span" fontWeight="bold">Mémoire : </Box>
                        <Box color="primary">{formatBytes(defaultNumber(memory))}</Box>
                    </Box>
                </Box>
            }
        },
    };
    const columnsKeys =Object.keys(fields);
    const headerCols = useMemo(()=>{
        const h = [];
        for(let i in fields){
            const field = fields[i];
            h.push(<Th key={`${i}`} w={field.width} fontWeight="bold">{field.label}</Th>)
        }
        return h;
    },[])
    return <Box>
        <Box alignItems="center" ml="1.5rem" mt="10px" mb="10px" w="100%" fontWeight="bold" fontSize="16px" color="primary">Processus en  cours</Box>
        <TableContainer>
          <Table variant='simple'>
            <Thead>
              <Tr>
                {headerCols}
              </Tr>
            </Thead>
            <Tbody>
                {data.map((d,index)=>{
                    if(!isObj(d)) return null;
                    return <Tr key={d.name||index+""}>
                        {columnsKeys.map((i)=>{
                            let v = d[i] || undefined;
                            const columnDef = fields[i];
                            if(typeof columnDef.render ==="function"){
                                v = columnDef.render({rowData:d,columnDef,columnField:i});
                            }
                            return <Td key={`${i}-${d.name}`}>{v}</Td>
                        })}
                    </Tr>
                })}
            </Tbody>
          </Table>
        </TableContainer>
        {isLoading ? <Box display="flex" w="100%" justifyContent="center" alignItems="center">
            <CircularProgress isIndeterminate/>
        </Box>:null}
    </Box>
}
export const PM2Context = createContext(null);
export const usePM2 = ()=> useContext(PM2Context);

const Status = ({rowData,withButton,...rest})=>{
    const {status} = getEnv(rowData);
        let color = undefined, icon = undefined, title="",text="";
        switch(status){
            case "online" : 
                color = "success";
                icon = "check";
                text = title = "Démarré";
                break;
            case "stopping":
                color = "warning";
                icon = "NotAllowedIcon";
                text = title = "En arrêt";
                break;
            case "launching":
                color = "warning";
                icon = <CircularProgress isIndeterminate size="20px" color="primary"/>;
                text = title = "Chargement";
                break;
            case "errored":
                color = "error";
                icon = "WarningIcon";
                title = "Une erreur est survenue";
                text= "Erreur";
                break;
            default : 
                color = "info";
                icon = "InfoIcon";
                title = "Information";
                text = "Info";
                break;
        }
        if(withButton){
            return <Button
                leftIcon={icon}
                title = {title}
                color = {color}
                children = {`Status : ${text}`}
                {...rest}
            />
        }
        return <Icon
            icon={icon}
            title = {title}
            color = {color}
            size = {"25px"}
        />
}

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}