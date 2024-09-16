import {YConverterCallback} from "./yHandlers.types";
import {Constructor, YPrimitive, YSharedType} from "../conversionManagment/conversionManagement.types";

export class YHandler<Type = any, YType extends YSharedType | YPrimitive = any> {
    public readonly dataType: Constructor<Type>;
    public readonly yType: Constructor<YType>;

    public fromYjs: (yValue: YType, recurse?: boolean) => Type | Promise<Type>;
    public toYjs: (yValue: YType, object: object, converter: YConverterCallback) => void;
    public diffFromYjs: (yValue: YType, oldObject: object) => void;
    public diffToYjs: (yValue: YType, newObject: object) => void;

    constructor(
        dataType: Constructor<Type>,
        yType: Constructor<YType>,
        fromYjs: (yValue: YType, recurse?: boolean) => Type | Promise<Type>,
        toYjs: (yValue: YType, object: object, converter: YConverterCallback) => void,
        diffFromYjs: (yValue: YType, newObject: object) => void,
        diffToYjs: (yValue: YType, newObject: object) => void
    ) {
        this.dataType = dataType;
        this.yType = yType;

        this.fromYjs = fromYjs;
        this.toYjs = toYjs;
        this.diffFromYjs = diffFromYjs;
        this.diffToYjs = diffToYjs;
    }

    public get name(): string {
        return this.dataType.name;
    }
}