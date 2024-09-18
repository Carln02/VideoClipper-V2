import { YProxy } from "../yProxy";
import {YPrimitive} from "../yProxy.types";

export class YPrimitiveProxy<Type extends YPrimitive = "string"> extends YProxy<Type, Type> {
    public static toYjs(data: YPrimitive, key: string | number, parent: YProxy): YPrimitive {
        if (parent && key !== undefined) parent.setByKey(key, data);
        return data;
    }

    public static canHandle(data: unknown): boolean {
        return typeof data == "boolean" || typeof data == "number" || typeof data == "string";
    }

    public diffAndUpdate(data: Type): void {
        if (this.yData === data) return;
        this.yData = data as Type;
        if (this.parent) this.parent.setByKey(this.key, this.yData);
    }

    protected getByKey(): unknown {
        throw new Error("Cannot get property of a primitive value.");
    }

    public setByKey(): boolean {
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
        return this.yData as Type;
    }

    public [Symbol.toPrimitive](hint: string) {
        if (hint === "number") {
            return Number(this.value);
        } else if (hint === "string") {
            return String(this.value);
        } else {
            return this.value;
        }
    }
}