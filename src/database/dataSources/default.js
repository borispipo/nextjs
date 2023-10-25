import {defaultStr} from "$cutils";
export const defaultDataSource = defaultStr(process.env.DB_DEFAULT_DATA_SOURCE_TYPE,"mysql").trim().toLowerCase();

export default defaultDataSource;