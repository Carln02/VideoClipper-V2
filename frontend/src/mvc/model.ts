import {auto} from "turbodombuilder";

export abstract class Model<
    DataType extends object = object,
    DataKeyType extends string | number = string | number
> {
    protected readonly dataMap: Map<string, DataType> = new Map();

    public keyChangedCallback: (keyName: DataKeyType, ...args: any[]) => void;

    protected constructor(data?: DataType) {
        this.setDataBlock(data, this.defaultBlockKey, false);
    }

    public get data(): DataType {
        return this.getDataBlock() as DataType;
    }

    public set data(value: DataType) {
        this.setDataBlock(value);
    }

    @auto()
    public set enabledCallbacks(value: boolean) {}

    protected getData(key: DataKeyType, blockKey?: string): unknown {
        if (!blockKey) return null;
        return this.dataMap.get(blockKey)?.[key as any];
    }

    protected setData(key: DataKeyType, value: unknown, blockKey?: string): void {
        if (!blockKey) return;
        const block = this.dataMap.get(blockKey);
        if (block) block[key as any] = value;
        if (this.enabledCallbacks) this.fireKeyChangedCallback(key, blockKey);
    }

    public getSize(blockKey: string = this.defaultBlockKey): number {
        const block = this.dataMap.get(blockKey);
        return block ? Object.keys(block).length : 0;
    }

    protected getDataBlock(blockKey: string = this.defaultBlockKey): DataType {
        return this.dataMap.get(blockKey);
    }

    protected setDataBlock(value: DataType, blockKey: string = this.defaultBlockKey, initialize: boolean = true) {
        if (!value) return;
        this.dataMap.set(blockKey, value);
        if (initialize) this.initialize(blockKey);
    }

    protected get defaultBlockKey(): string {
        return this.dataMap.size > 1 ? null : this.dataMap.size > 0 ? this.dataMap.keys().next().value : "0";
    }

    protected fireKeyChangedCallback(key: DataKeyType, blockKey: string = this.defaultBlockKey, deleted: boolean = false) {
        this.keyChangedCallback(key, deleted ? undefined : this.getData(key, blockKey));
    }

    public initialize(blockKey: string = this.defaultBlockKey) {
        const block = this.getDataBlock(blockKey);
        if (!block || !this.enabledCallbacks) return;
        Object.keys(block).forEach(key => this.fireKeyChangedCallback(key as DataKeyType, blockKey));
    }

    public clear(blockKey: string = this.defaultBlockKey) {
    }

    public getAllKeys(blockKey: string = this.defaultBlockKey): DataKeyType[] {
        if (blockKey) {
            const block = this.dataMap.get(blockKey);
            if (block) return Object.keys(block) as DataKeyType[];
        } else {
            const output = [];
            for (const block of this.dataMap.values()) {
                if (block) output.concat(Object.keys(block));
            }
            return output;
        }
    }

    public getAllData(blockKey: string = this.defaultBlockKey): unknown[] {
        const output = [];
        if (blockKey) {
            this.getAllKeys(blockKey)?.forEach(key => output.push(this.getData(key, blockKey)));
        } else {
            for (const curBlockKey of this.dataMap.keys()) {
                this.getAllKeys(curBlockKey)?.forEach(key => output.push(this.getData(key, curBlockKey)));
            }
        }
        return output;
    }
}