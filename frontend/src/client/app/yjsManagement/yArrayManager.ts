import {YComponent} from "./yComponent";
import {YTypeManager} from "./yTypeManager";
import {YArray, YArrayEvent} from "../../../yProxy";

export class YArrayManager<DataType, ComponentType extends YComponent> extends YTypeManager<DataType, ComponentType,
    number, YArray<DataType>> {

    public constructor(data?: YArray<DataType>) {
        super(data);
    }

    public setData(index: number, value: DataType, blockKey: string = this.defaultBlockKey) {
        if (!blockKey) return;
        const data = this.getDataBlock(blockKey);
        if (index < data.length) data.delete(index, 1);
        data.insert(index, [value]);
    }

    public getData(index: number, blockKey: string = this.defaultBlockKey): DataType {
        if (blockKey) return this.getDataBlock(blockKey).get(index);
        for (const block of this.dataMap.values()) {
            if (block.length > index && index > 0) return block.get(index);
        }
    }

    public initialize(blockKey: string = this.defaultBlockKey) {
        if (!this.onAdded) return;
        this.getDataBlock(blockKey)?.toArray()?.forEach((_item, index) => this.addInstance(index, blockKey));
    }

    protected observeChanges(event: YArrayEvent, blockKey: string = this.defaultBlockKey) {
        let currentIndex = 0;

        for (const delta of event.delta) {
            if (delta.retain !== undefined) {
                currentIndex += delta.retain;
            } else if (delta.insert && Array.isArray(delta.insert)) {
                delta.insert.forEach((_item: DataType, i: number) => this.addInstance(currentIndex + i, blockKey));
                currentIndex += delta.insert.length;
            } else if (delta.delete) {
                for (let i = 0; i < delta.delete; i++) {
                    this.onDeleted?.(undefined, this.getInstance(currentIndex, blockKey), currentIndex, blockKey);
                }
            }
        }
    }
}