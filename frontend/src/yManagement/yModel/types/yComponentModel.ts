import {YMap, YMapEvent} from "../../yManagement.types";
import {YModel} from "../yModel";
import {MvcBlockKeyType} from "turbodombuilder";

/**
 * @class YComponentModel
 * @extends YModel
 * @description An MVC model that handles a Yjs map and observes changes on its direct fields, firing change
 * callbacks at the keys that changed through the emitter.
 */
export class YComponentModel extends YModel<any, YMap, string> {
    protected observeChanges(event: YMapEvent, blockKey?: MvcBlockKeyType<"map">): void {
        event.keysChanged.forEach(key => {
            const change = event.changes.keys.get(key);
            this.fireKeyChangedCallback(key, blockKey, change.action == "delete");
        });
    }
}