import { createEntity } from "$ndatabase/schema";
import fields from "./fields";

export const name = 'Sites';

export const tableName = 'sites';

export default createEntity({
    tableName,
    name,
    name,
    fields,
});