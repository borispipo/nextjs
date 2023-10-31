const { EventEmitter } = require("events");

export const model = new EventEmitter();
export const MODEL = model;

export const APP = new EventEmitter();
export const app = APP;

export default {
    model,MODEL,APP,app
}