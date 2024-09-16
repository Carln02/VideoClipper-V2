import {YHandler} from "../yHandler";
import {Constructor, YPrimitive} from "../../conversionManagment/conversionManagement.types";

class Primitive {
    constructor(value: YPrimitive) {
        return value;
    }
}

function getValue(value: YPrimitive): YPrimitive {
    return value;
}

function diffFromYjs(value: YPrimitive, oldObject: object): void {
    //TODO
}

function diffToYjs(value: YPrimitive, newObject: object): void {
    //TODO
}

export const primitiveHandler = new YHandler(Primitive, Primitive as Constructor<YPrimitive>,
    getValue, getValue, diffFromYjs, diffToYjs);