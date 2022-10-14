import { createEntity } from "$ndatabase/schema";
import fields  from "./fields";

export const name = 'Customers';

export const tableName = 'customers';

export default createEntity({
    tableName,
    name,
    fields,
});