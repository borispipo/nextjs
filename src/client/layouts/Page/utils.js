"use client"
import appConfig from "$capp/config";
import {defaultStr} from "$cutils";
export const defaultTitle = defaultStr(appConfig.title,appConfig.name);

export const defaultDescription = defaultStr(appConfig.description);