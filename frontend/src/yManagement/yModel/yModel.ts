import {YAbstractType, YMap, YArray, YEvent} from "../yManagement.types";
import {auto, TurboModel} from "turbodombuilder";

/**
 * @class YComponent
 * @extends TurboElement
 * @description A general class representing a component attached to a Ywrapped data object. It takes as a
 * generic the datatype of the data that is shared through Yjs. Components that extend this class would ideally
 * include defined callbacks that will be triggered by Thibaut's Ywrapper accordingly when the attached data changes.
 * @template DataType
 */
export abstract class YModel<
    DataType extends object = any,
    YType extends YMap | YArray = YMap | YArray,
    IdType extends string | number = string | number
> extends TurboModel<YType, IdType> {
    protected observerMap: Map<string, (event: YEvent) => void> = new Map();

    public constructor(data?: DataType | YType) {
        super(data as YType);
        this.enabledCallbacks = true;
    }

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

    @auto()
    public set enabledCallbacks(value: boolean) {
        this.observerMap.forEach((observer, blockKey) => {
            const block = this.getDataBlock(blockKey);
            if (!block) return;
            if (value) block.observe(observer);
            else block.unobserve(observer);
        });
    }

    protected abstract getData(key: IdType, blockKey?: string): DataType;
    protected abstract setData(key: IdType, value: DataType, blockKey?: string): void;

    public getSize(blockKey: string = this.defaultBlockKey): number {
        let counter = 0;
        this.dataMap.get(blockKey)?.forEach(() => counter++);
        return counter;
    }

    protected setDataBlock(value: YType, id?: string, blockKey: string = this.defaultBlockKey, initialize: boolean = true) {
        if (this.enabledCallbacks) {
            const block = this.getDataBlock(blockKey);
            const observer = this.observerMap.get(blockKey);
            if (block && observer) block.unobserve(observer);
        }
        //TODO FIX --- this.clear(blockKey);
        this.dataMap.set(blockKey, value);
        if (initialize) this.initialize(blockKey);
    }

    public initialize(blockKey: string = this.defaultBlockKey) {
        let block = this.getDataBlock(blockKey);
        if (!block) return;
        if (block instanceof YArray) block = block.toArray() as any;
        if (this.enabledCallbacks) block?.forEach((_value, key) => this.fireKeyChangedCallback(key, blockKey));

        const observerFunction = (event: YEvent) => this.observeChanges(event, blockKey);
        this.observerMap.set(blockKey, observerFunction);
        if (this.enabledCallbacks) block.observe(observerFunction);
    }

    protected abstract observeChanges(event: YEvent, blockKey?: string): void;

    public getAllKeys(blockKey: string = this.defaultBlockKey): IdType[] {
        const output = [];
        if (blockKey) {
            const block = this.dataMap.get(blockKey);
            block?.forEach((_value, key) => output.push(key));
        } else {
            for (const block of this.dataMap.values()) {
                block?.forEach((_value, key) => output.push(key));
            }
        }
        return output;
    }
}