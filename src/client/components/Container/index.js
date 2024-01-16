"use client"
import {Container} from "$ui";
import {useGetContainerProps} from "./hooks";
export * from "./hooks";
export default function ContainerComponent(props){
    const r = useGetContainerProps(props);
    return <Container
        {...r}
    />
}

ContainerComponent.propTypes = Object.assign({},Container.propTypes)