import {Heading} from "$ui";
import {withStyles} from "$theme";

function HeadingComponent(props){
    return <Heading {...props}/>
};

HeadingComponent.displayName = "HeadingComponent";

export default withStyles(HeadingComponent,{variant:"ghost",className:"heading"});

