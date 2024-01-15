"use client"
import fetch from "$capi";
import {useEffect,useState,useMemo} from "react";
const rootPath = `pm2`;
import Box from "$ncomponents/Box"
import Button from "$ncomponents/Button";
import Container from "$ncomponents/Container";
import {Table,Thead,Tbody,Tfoot,Tr,Th,Td,TableCaption,TableContainer} from '$ui'
import {defaultNumber,isObj} from "$cutils";
import CircularProgress from "$ncomponents/CircularProgress";
import Icon from "$ncomponents/Icon";

const fetchList = (opts)=>fetch(rootPath,opts);


export default function PM2Page (){
    return <Container>
        <Box w="100%">
            <ListProcesses/>
        </Box>
    </Container>
}

const ListProcesses = ()=>{
    const [data,setData] = useState([]);
    const [isLoading,setIsLoading] = useState(true);
    const refresh = ()=>{
        if(!isLoading){
            setIsLoading(true);
        }
        fetchList().then(({data})=>{
            console.log("found ",data);
           setData(data);
        }).finally(()=>{
            setIsLoading(false);   
        })
    }
    useEffect(()=>{
        refresh();
    },[]);
    const getEnv = (rowData)=>Object.assign({},rowData.pm2_env);
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
            const {status} = getEnv(rowData);
            let color = undefined, icon = undefined, title="";
            switch(status){
                case "online" : 
                    color = "success";
                    icon = "md-check";
                    title = "Démarré";
                    break;
                case "stopping":
                    color = "warning";
                    icon = "md-stop";
                    title = "En arrêt";
                    break;
                case "launching":
                    color = "warning";
                    icon = <CircularProgress isIndeterminate size="20px" color="primary"/>;
                    title = "Chargement";
                    break;
                case "errored":
                    color = "error";
                    icon = "md-error";
                    title = "Une erreur est survenue";
                    break;
                default : 
                    color = "info";
                    icon = "material-info";
                    title = "Information";
                    break;
            }
            return <Icon
                icon={icon}
                title = {title}
                color = {color}
                size = {"25px"}
            />
          }
        },
        type : {
            label : "Message",
        },
        pm_id : {
            label : "Id | daemon"
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
        <Box alignItems="center" textAlign="center" w="100%" fontWeight="bold" fontSize="16" color="primary">Processus en  cours</Box>
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

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}