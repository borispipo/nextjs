import BaseModel from "../Base";
import Entity from "./entity";

export default class SitesModel extends BaseModel {
    static fields = Entity.fields;
    static tableName = Entity.tableName;
    static name = Entity.name;
    static Entity = Entity;
};