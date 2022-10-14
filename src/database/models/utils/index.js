import Base64  from "$base64";
import { isNonNullString } from "$utils";

export const comparePassword = (pass1,pass2)=>{
    if(!isNonNullString(pass1) && !isNonNullString(pass2)) return true;
    if(pass1 === pass2) return true;
    const b1 = Base64.encode(pass1),b2 = Base64.encode(pass2);
    const _b1 = Base64.decode(pass1);
    return b1 == b2 || pass1 == b2 || b1 == pass2 || _b1 == pass2;
}