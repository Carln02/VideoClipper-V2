import {YAbstractType, YMap, YArray, YEvent, YDataBlock} from "../yManagement.types";
import {auto, MvcBlockKeyType, TurboModel} from "turbodombuilder";

/**
 * @class YComponent
 * @extends TurboElement
 * @description A general class representing a component attached to a Ywrapped data object. It takes as a
 * generic the datatype of the data that is shared through Yjs. Components that extend this class would ideally
 * include defined callbacks that will be triggered by Thibaut's Ywrapper accordingly when the attached data changes.
 * @template DataType
 */
export abstract class YModel<
    DataType = any,
    YType extends YMap | YArray = YMap | YArray,
    KeyType extends string | number = string | number,
    IdType extends string | number = string,
    BlocksType extends "array" | "map" = "map",
    BlockType extends YDataBlock<YType, IdType> = YDataBlock<YType, IdType>,
> extends TurboModel<YType, KeyType, IdType, BlocksType, BlockType> {
    /**
     * @description The observed data. When it is set, this component will set again all the defined setters.
     */
    public get data(): DataType & YType {
        return super.data as DataType & YType;
    }

    public set data(value: DataType | YType) {
        if (!(value instanceof YAbstractType)) return;
        super.data = value;
    }

    public constructor(data?: YType, dataBlocksType?: BlocksType) {
        super(data, dataBlocksType);
    }

    @auto()
    public set enabledCallbacks(value: boolean) {
        this.getAllBlocks().forEach(block => {
            if (!block.observer || !block.data) return;
            if (value) block.data.observe(block.observer);
            else block.data.unobserve(block.observer);
        });
    }

    public getData(key: KeyType, blockKey: MvcBlockKeyType<BlocksType> = this.defaultBlockKey): any {
        const data = this.getBlockData(blockKey);
        if (data instanceof YMap) return data.get(key.toString());
        if (data instanceof YArray) {
            const index = Number(key);
            if (index >= 0 && index < data.length) return data.get(index);
        }
        return null;
    }

    public setData(key: KeyType, value: unknown, blockKey: MvcBlockKeyType<BlocksType> = this.defaultBlockKey) {
        const data = this.getBlockData(blockKey);
        if (data instanceof YMap) data.set(key.toString(), value);
        else if (data instanceof YArray) {
            const index = Number(key);
            if (index < 0) return;
            if (index < data.length) data.delete(index, 1);
            data.insert(index, [value]);
        }
    }

    public getSize(blockKey: MvcBlockKeyType<BlocksType> = this.defaultBlockKey): number {
        const data = this.getBlockData(blockKey);
        if (data instanceof YMap || data instanceof YArray) return (data instanceof YArray) ? data.length : data.size;
        return 0;
    }

    public createBlock(value: YType, id?: IdType, blockKey: MvcBlockKeyType<BlocksType> = this.defaultBlockKey): BlockType {
        return {
            ...super.createBlock(value, id),
            observer: (event: YEvent) => this.observeChanges(event, blockKey)
        } as BlockType;
    }

    public setBlock(value: YType, id?: IdType, blockKey: MvcBlockKeyType<BlocksType> = this.defaultBlockKey, initialize: boolean = true) {
        if (this.enabledCallbacks) {
            const block = this.getBlock(blockKey);
            if (block && block.data && block.observer) block.data.unobserve(block.observer);
        }

        this.clear(blockKey);
        super.setBlock(value, id, blockKey, initialize);
    }

    public initialize(blockKey: MvcBlockKeyType<BlocksType> = this.defaultBlockKey) {
        super.initialize(blockKey);
        const block = this.getBlock(blockKey);
        block?.data?.observe(block?.observer);
    }

    protected abstract observeChanges(event: YEvent, blockKey?: MvcBlockKeyType<BlocksType>): void;

    public getAllKeys(blockKey: MvcBlockKeyType<BlocksType> = this.defaultComputationBlockKey): KeyType[] {
        const output: KeyType[] = [];
        for (const block of this.getAllBlocks(blockKey)) {
            const data = block.data;
            if (data instanceof YMap) output.push(...Array.from(data.keys()) as KeyType[]);
            else if (data instanceof YArray) {
                for (let i = 0; i < data.length; i++) output.push(i as KeyType);
            }
        }
        return output;
    }

    protected getAllObservers(blockKey: MvcBlockKeyType<BlocksType> = this.defaultComputationBlockKey): ((event: YEvent) => void)[] {
        return this.getAllBlocks(blockKey).map(block => block.observer);
    }
}