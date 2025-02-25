import {YMap, YArray} from "../../../yManagement.types";
import {YModel} from "../../yModel";
import {TurboElement} from "turbodombuilder";

export abstract class YManagerModel<
    DataType extends object,
    ComponentType extends TurboElement, IdType extends string | number,
    YType extends YMap | YArray
> extends YModel<DataType, YType, IdType> {
    protected readonly instancesMap: Map<string, Map<IdType, ComponentType>> = new Map();

    public onAdded: (data: DataType, id: IdType, blockKey: string) => ComponentType;

    public onUpdated: (data: DataType, instance: ComponentType, id: IdType, blockKey: string) => void =
        (data, instance, id) => {
            instance.data = data as object;
            instance.dataId = id.toString();
        };

    public onDeleted: (data: DataType, instance: ComponentType, id: IdType, blockKey: string) => void =
        (_data, instance, id, blockKey) => {
            instance?.remove();
            this.instancesMap.get(blockKey).delete(id);
        };

    protected constructor(data?: YType) {
        super(data);
    }

    public initialize(blockKey: string = this.defaultBlockKey) {
        this.instancesMap.set(blockKey, new Map());
        super.initialize(blockKey);
    }

    public getInstance(key: IdType, blockKey: string = this.defaultBlockKey): ComponentType {
        if (blockKey) return this.instancesMap.get(blockKey).get(key);
        for (const block of this.instancesMap.values()) {
            if (block.has(key)) return block.get(key);
        }
    }

    public getAllComponents(blockKey: string = this.defaultBlockKey): ComponentType[] {
        if (blockKey) {
            const block = this.instancesMap.get(blockKey);
            if (!block) return [];
            return Array.from(block.values());
        }
        const output = [];
        for (const block of this.instancesMap.values()) output.concat(Array.from(block.values()));
        return output;
    }

    public clear(blockKey: string = this.defaultBlockKey) {
        super.clear(blockKey);
        if (!this.instancesMap) return;
        if (blockKey) {
            this.instancesMap.get(blockKey)?.forEach(instance => instance.remove());
            this.instancesMap.get(blockKey)?.clear();
        } else {
            for (const block of this.instancesMap.values()) {
                block.forEach(instance => instance.remove());
                block.clear();
            }
        }
    }

    protected fireKeyChangedCallback(key: IdType, blockKey?: string) {
        if (!this.onAdded) return;

        const data = this.getData(key, blockKey) as DataType;
        const instance = this.onAdded(data, key, blockKey);

        if (!instance) return;
        this.instancesMap.get(blockKey).set(key, instance);
        this.onUpdated?.(data, instance, key, blockKey);
    }
}