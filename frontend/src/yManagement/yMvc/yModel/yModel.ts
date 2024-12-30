import {YAbstractType, YMap, YArray, YEvent} from "../../yManagement.types";
import {Model} from "../../../mvc/model";

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
> extends Model<YType, IdType> {
    protected observerMap: Map<string, (event: YEvent) => void> = new Map();

    protected constructor(data: DataType | YType) {
        super(data as YType);
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

    public getSize(blockKey: string = this.defaultBlockKey): number {
        let counter = 0;
        this.dataMap.get(blockKey)?.forEach(() => counter++);
        return counter;
    }

    protected setDataBlock(value: YType, blockKey: string = this.defaultBlockKey, initialize: boolean = true) {
        this.dataMap.get(blockKey)?.unobserve(this.observerMap.get(blockKey) as any);
        this.clear(blockKey);
        this.dataMap.set(blockKey, value);
        if (initialize) this.initialize(blockKey);
    }

    public initialize(blockKey: string = this.defaultBlockKey) {
        let block = this.getDataBlock(blockKey);
        if (!block) return;
        if (block instanceof YArray) block = block.toArray() as any;
        block?.forEach((_value, key) => this.callbackOnKeyChange(key, blockKey));

        const observerFunction = (event: YEvent) => this.observeChanges(event, blockKey);
        this.observerMap.set(blockKey, observerFunction);
        block.observe(observerFunction as any);
    }

    protected clear(blockKey: string = this.defaultBlockKey) {
    }

    protected abstract observeChanges(event: YEvent, blockKey?: string): void;

    protected abstract callbackOnKeyChange(key: IdType, blockKey?: string, deleted?: boolean);

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