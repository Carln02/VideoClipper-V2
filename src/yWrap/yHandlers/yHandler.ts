import {YMap} from "../conversionManagment/yjsEnhancement";
import {YConverterCallback} from "./yHandlers.types";

export class YHandler<Type extends object = object> {
    public readonly type: Type;

    public fromYjs: (yMap: YMap, recurse?: boolean) => object;
    public toYjs: (yMap: YMap, object: object, converter: YConverterCallback) => void;
    public diffFromYjs: (yMap: YMap, oldObject: object) => void;
    public diffToYjs: (yMap: YMap, newObject: object) => void;

    constructor(
        type: Type,
        fromYjs: (yMap: YMap, recurse?: boolean) => object,
        toYjs: (yMap: YMap, object: object, converter: YConverterCallback) => void,
        diffFromYjs: (yMap: YMap, newObject: object) => void,
        diffToYjs: (yMap: YMap, newObject: object) => void
    ) {
        this.type = type;
        this.fromYjs = fromYjs;
        this.toYjs = toYjs;
        this.diffFromYjs = diffFromYjs;
        this.diffToYjs = diffToYjs;
    }

    public get classType(): Function {
        return this.type instanceof Function ? this.type : this.type.constructor;
    }

    public get name(): string {
        return this.classType.name;
    }
}