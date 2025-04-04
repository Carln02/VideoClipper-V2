import {YArray, YArrayEvent} from "../../../../yManagement.types";
import {YManagerModel} from "../yManagerModel";

export class YArrayManagerModel<
    DataType extends object,
    ComponentType extends object
> extends YManagerModel<DataType, ComponentType,
    number, YArray<DataType>> {

    public constructor(data?: YArray<DataType>) {
        super(data);
    }

    protected getData(index: number, blockKey: string = this.defaultBlockKey): DataType {
        if (blockKey) return this.getDataBlock(blockKey).get(index);
        for (const block of this.dataMap.values()) {
            if (block.length > index && index > 0) return block.get(index);
        }
    }

    protected setData(index: number, value: DataType, blockKey: string = this.defaultBlockKey) {
        if (!blockKey) return;
        const data = this.getDataBlock(blockKey);
        if (index < data.length) data.delete(index, 1);
        data.insert(index, [value]);
    }

    protected observeChanges(event: YArrayEvent, blockKey: string = this.defaultBlockKey) {
        let currentIndex = 0;
        for (const delta of event.delta) {
            if (delta.retain !== undefined) currentIndex += delta.retain;
            else if (delta.insert) {
                const insertedItems = Array.isArray(delta.insert) ? delta.insert : [delta.insert];
                const count = insertedItems.length;
                this.shiftIndices(currentIndex, count, blockKey);
                for (let i = 0; i < count; i++) this.fireKeyChangedCallback(currentIndex + i, blockKey);
                currentIndex += count;
            } else if (delta.delete) {
                const count = delta.delete;
                for (let i = 0; i < count; i++) {
                    this.onDeleted?.(undefined, this.getInstance(currentIndex + i, blockKey), currentIndex + i, blockKey);
                }
                this.shiftIndices(currentIndex + count, -count, blockKey);
            }
        }
    }

    private shiftIndices(fromIndex: number, offset: number, blockKey: string = this.defaultBlockKey) {
        const block = this.instancesMap.get(blockKey);
        if (!block) return;

        const itemsToShift: [number, ComponentType][] = [];
        for (const [oldIndex, instance] of block.entries()) {
            if (oldIndex >= fromIndex) itemsToShift.push([oldIndex, instance]);
        }

        itemsToShift.sort((a, b) => a[0] - b[0]);
        for (const [oldIndex] of itemsToShift) block.delete(oldIndex);
        for (const [oldIndex, instance] of itemsToShift) {
            const newIndex = oldIndex + offset;
            if ("dataId" in instance) instance.dataId = newIndex;
            block.set(oldIndex + offset, instance);
        }
    }

    public getAllComponents(blockKey: string = this.defaultBlockKey): ComponentType[] {
        const block = this.instancesMap.get(blockKey);
        if (!block) return;

        const instances: [number, ComponentType][] = [];
        for (const [index, instance] of block.entries()) instances.push([index, instance]);
        instances.sort((a, b) => a[0] - b[0]);
        return instances.map(([, instance]) => instance);
    }
}