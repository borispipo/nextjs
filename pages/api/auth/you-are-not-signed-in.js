import { NOT_SIGNED_IN } from "$capi/status";

/**
 *
 *@api {get} /auth/you-are-not-signed-in page de redirection des utilisateurs non connecté
  @apiName {Redirect When User is  not SignIn}
  @apiGroup auth
* @apiVersion 1.0.0
 */
export default function handle(req,res){
    const error = ({status :NOT_SIGNED_IN,message:"Vous n'êtes pas autorisé à accéder à la ressource demandéee car vous êtes non connecté!! Merci de vous connecter."});
    res.status(NOT_SIGNED_IN).json(error);
}