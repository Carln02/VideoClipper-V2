import {YComponent} from "./yComponent";
import {YTypeManager} from "./yTypeManager";
import {YMap, YMapEvent} from "../../../yProxy";

export class YMapManager<DataType, ComponentType extends YComponent> extends YTypeManager<DataType, ComponentType,
    string, YMap<DataType>> {

    public constructor(data?: YMap<DataType>) {
        super(data);
    }

    public getData(key: string, blockKey: string = this.defaultBlockKey): DataType {
        if (blockKey) return this.getDataBlock(blockKey).get(key);
        for (const block of this.dataMap.values()) {
            if (block.has(key)) return block.get(key);
        }
    }

    public setData(key: string, value: DataType, blockKey: string = this.defaultBlockKey) {
        if (blockKey) this.getDataBlock(blockKey).set(key, value);
    }

    public initialize(blockKey: string = this.defaultBlockKey) {
        if (!this.onAdded) return;
        this.getDataBlock(blockKey)?.forEach((_value, key) => this.addInstance(key, blockKey));
    }

    protected observeChanges(event: YMapEvent, blockKey: string = this.defaultBlockKey) {
        event.keysChanged.forEach(key => {
            const change = event.changes.keys.get(key);
            switch (change.action) {
                case "add":
                    this.addInstance(key, blockKey);
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