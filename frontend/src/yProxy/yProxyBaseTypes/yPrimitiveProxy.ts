import {YProxy} from "../yProxy/yProxy";
import {YPrimitive, YProxyChanged} from "../yProxy/types/base.types";
import {YProxyEventName} from "../yProxy/types/events.types";

export class YPrimitiveProxy<Type extends YPrimitive = "string"> extends YProxy<Type, Type> {
    public static toYjs(data: YPrimitive, key: string | number, parent: YProxy): YPrimitive {
        if (parent && key !== undefined) parent.setByKey(key, data);
        return data;
    }

    public static canHandle(data: unknown): boolean {
        return typeof data == "boolean" || typeof data == "number" || typeof data == "string";
    }

    protected diffChanges(newValue: Type, toBeDeleted: boolean = false, oldValue: Type = this.value): YProxyChanged {
        const changedState: YProxyChanged = {
            selfChanged: false,
            entryChanged: false,
            subTreeChanged: false,
        };

        if (toBeDeleted) {
            this.changeHandler.scheduleChange(newValue, oldValue, YProxyEventName.deleted);
            changedState.selfChanged = true;
        } else if (oldValue !== newValue) {
            this.changeHandler.scheduleChange(newValue, oldValue, YProxyEventName.updated);
            changedState.selfChanged = true;
        }

        return changedState;
    }

    public getByKey(): unknown {
        throw new Error("Cannot get property of a primitive value.");
    }

    public setByKey(): boolean {
        throw new Error("Cannot set property of a primitive value.");
    }

    public deleteByKey(): boolean {
        throw new Error("Cannot delete property of a primitive value.");
    }

    public hasByKey(): boolean {
        return false;
    }

    // Primitive types don't have keys, so return an empty array
    public getYjsKeys(): string[] {
        return [];
    }

    public toJSON(): Type {
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