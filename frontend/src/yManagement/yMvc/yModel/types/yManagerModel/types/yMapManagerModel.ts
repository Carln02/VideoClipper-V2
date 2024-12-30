import {YMap, YMapEvent } from "../../../../../yManagement.types";
import {YManagerModel} from "../yManagerModel";
import {YComponent} from "../../../../yComponent";

export class YMapManagerModel<
    DataType extends object,
    ComponentType extends YComponent
> extends YManagerModel<DataType, ComponentType,
    string, YMap<DataType>> {

    public constructor(data: YMap<DataType>) {
        super(data);
    }

    protected getData(key: string, blockKey: string = this.defaultBlockKey): DataType {
        if (blockKey) return this.getDataBlock(blockKey).get(key);
        for (const block of this.dataMap.values()) {
            if (block.has(key)) return block.get(key);
        }
    }

    protected setData(key: string, value: DataType, blockKey: string = this.defaultBlockKey) {
        if (blockKey) this.getDataBlock(blockKey).set(key, value);
    }

    protected observeChanges(event: YMapEvent, blockKey: string = this.defaultBlockKey) {
        event.keysChanged.forEach(key => {
            const change = event.changes.keys.get(key);
            switch (change.action) {
                case "add":
                    this.callbackOnKeyChange(key, blockKey);
                    break;
                case "delete":
                    this.onDeleted?.(change.oldValue as DataType, this.getInstance(key, blockKey), key, blockKey);
                    break;
                case "update":
                    this.onUpdated?.(this.getData(key, blockKey), this.getInstance(key, blockKey), key, blockKey);
                    break;
            }
        });
    }
}