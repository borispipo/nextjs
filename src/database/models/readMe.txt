--- @see : https://typeorm.io/entities#column-options for more
--- Tutorial d'ajout d'un nouveau model
    1. Dans le repertoire /models, créer un répertoire portant le nom du model à ajouter : exemple /models/MyCustomModel
    2. Dans /models/MyCustomModel, 
        a) creer un fichier fields.js, portant les informations sur les colonnes du model. se servir du mode /models/Customers par exemple
        b) creer un fichier entity, contant les informatins sur l'entité EntitySchema du package typeorm; 
        c) creer un fichier index contenant le code : 
            import BaseModel from "../Base";
            import Entity from "./entity";
            export default class MyCustomModel extends BaseModel {
                static fields = Entity.fields;
                static tableName = Entity.tableName;
                static name = Entity.name;
                static Entity = Entity;
            };

    3.  Modifier le fichier /models/entifies, et faire déclarer l'entity MyCustomModelEntity MyCustomModel parmis la liste des modèles crées
    4.  Modifier le fichier /models/all.js, faire déclarer le model MyCustomModel dans la variable all du dit fichier. ne pas oublier de l'importer à lavance