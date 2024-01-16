import {Text} from "$ui";
import {withStyles} from "$theme";

function TextComponent(props){
    return <Text color="text" {...props}/>
};

TextComponent.displayName = "TextComponent";

export default withStyles(TextComponent,{variant:"ghost",className:"text"});

