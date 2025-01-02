import {YMap, YMapEvent} from "../../../yManagement.types";
import {YModel} from "../yModel";

/**
 * @class YComponent
 * @extends TurboElement
 * @description A general class representing a component attached to a Ywrapped data object. It takes as a
 * generic the datatype of the data that is shared through Yjs. Components that extend this class would ideally
 * include defined callbacks that will be triggered by Thibaut's Ywrapper accordingly when the attached data changes.
 * @template DataType
 */
export class YComponentModel extends YModel<any, YMap, string> {
    protected getData(key: string, blockKey: string = this.defaultBlockKey): any {
        const data = this.getDataBlock(blockKey);
        if (!data || !(data instanceof YMap)) return undefined;
        return data.get(key);
    }

    protected setData(key: string, value: unknown, blockKey: string = this.defaultBlockKey) {
        const data = this.getDataBlock(blockKey);
        if (!data || !(data instanceof YMap)) return;
        data.set(key, value);
    }

    protected observeChanges(event: YMapEvent, blockKey: string | undefined): void {
        event.keysChanged.forEach(key => {
            const change = event.changes.keys.get(key);
            this.fireKeyChangedCallback(key, blockKey, change.action == "delete");
        });
    }
}