import { YProxy } from "../yProxy";
import {YPrimitive} from "../yProxy.types";
import {YProxyFactory} from "../../yProxyFactory/yProxyFactory";

export class YPrimitiveProxy<Type extends YPrimitive> extends YProxy<Type, Type> {
    public static toYjs(data: YPrimitive, factory: YProxyFactory): YPrimitive {
        return data;
    }

    public static canHandle(data: unknown, factory: YProxyFactory): boolean {
        return typeof data == "boolean" || typeof data == "number" || typeof data == "string";
    }

    protected getByKey(): unknown {
        throw new Error("Cannot get property of a primitive value.");
    }

    protected setByKey(): boolean {
        throw new Error("Cannot set property of a primitive value.");
    }

    protected deleteByKey(): boolean {
        throw new Error("Cannot delete property of a primitive value.");
    }

    protected hasByKey(): boolean {
        return false;
    }

    // Primitive types don't have keys, so return an empty array
    protected getYjsKeys(): string[] {
        return [];
    }

    protected toJSON(): Type {
        return this.yData;
    }
}