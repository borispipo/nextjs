const { EventEmitter } = require("events");

export const model = new EventEmitter();
export const MODEL = model;

export const APP = new EventEmitter();
export const app = APP;

export const AUTH = new EventEmitter();
export const auth = AUTH;

export default {
    model,MODEL,APP,app,auth,AUTH
}