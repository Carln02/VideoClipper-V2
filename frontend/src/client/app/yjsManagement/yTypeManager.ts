import {YComponent} from "./yComponent";
import {YMap, YMapEvent, YArray, YEvent} from "../../../yProxy";

export abstract class YTypeManager<DataType, ComponentType extends YComponent, IdType extends string | number,
    YType extends YMap | YArray> {
    protected readonly dataMap: Map<string, YType> = new Map();
    protected readonly observerMap: Map<string, (event: YMapEvent) => void> = new Map();
    protected readonly instancesMap: Map<string, Map<IdType, ComponentType>> = new Map();

    public onAdded: (data: DataType, id: IdType, blockKey: string) => ComponentType;

    public onUpdated: (data: DataType, instance: ComponentType, id: IdType, blockKey: string) => void =
        (data, instance, id) => {
            instance.data = data as object;
            instance.id = id.toString();
        };

    public onDeleted: (data: DataType, instance: ComponentType, id: IdType, blockKey: string) => void =
        (_data, instance, id, blockKey) => {
            instance?.remove();
            this.instancesMap.get(blockKey).delete(id);
        };

    protected constructor(data?: YType) {
        if (data) this.setDataBlock(data);
    }

    public get data(): YType {
        return this.getDataBlock();
    }

    public set data(value: YType) {
        this.setDataBlock(value);
    }

    public getInstance(key: IdType, blockKey: string = this.defaultBlockKey): ComponentType {
        if (blockKey) return this.instancesMap.get(blockKey).get(key);
        for (const block of this.instancesMap.values()) {
            if (block.has(key)) return block.get(key);
        }
    }

    public abstract getData(key: IdType, blockKey?: string): DataType;

    public abstract setData(key: IdType, value: DataType, blockKey?: string): void;

    public getDataBlock(blockKey: string = this.defaultBlockKey): YType {
        return this.dataMap.get(blockKey);
    }

    public setDataBlock(value: YType, blockKey: string = this.defaultBlockKey) {
        this.dataMap.get(blockKey)?.unobserve(this.observerMap.get(blockKey) as any);
        this.clear(blockKey);

        this.dataMap.set(blockKey, value);
        this.instancesMap.set(blockKey, new Map());
        this.initialize(blockKey);

        const observerFunction = (event: YMapEvent) => this.observeChanges(event, blockKey);
        this.observerMap.set(blockKey, observerFunction);
        value.observe(observerFunction as any);
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

    public getAllKeys(blockKey: string = this.defaultBlockKey): IdType[] {
        if (blockKey) {
            const block = this.instancesMap.get(blockKey);
            if (!block) return [];
            return Array.from(block.keys());
        }
        const output = [];
        for (const block of this.instancesMap.values()) output.concat(Array.from(block.keys()));
        return output;
    }

    public getAllData(blockKey: string = this.defaultBlockKey): DataType[] {
        return this.getAllKeys(blockKey).map(key => this.getData(key, blockKey));
    }

    public clear(blockKey: string = this.defaultBlockKey) {
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

    public abstract initialize(blockKey?: string): void;

    protected get defaultBlockKey(): string {
        return this.dataMap.size > 1 ? null : this.dataMap.size > 0 ? this.dataMap.keys().next().value : "0";
    }

    protected abstract observeChanges(event: YEvent, blockKey?: string): void;

    protected addInstance(key: IdType, blockKey: string = this.defaultBlockKey) {
        if (!this.onAdded) return;

        const data = this.getData(key, blockKey);
        const instance = this.onAdded(data, key, blockKey);

        if (!instance) return;
        this.instancesMap.get(blockKey).set(key, instance);
        this.onUpdated?.(data, instance, key, blockKey);
    }
}