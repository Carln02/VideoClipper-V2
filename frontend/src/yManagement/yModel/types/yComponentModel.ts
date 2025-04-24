import {YMap, YMapEvent} from "../../yManagement.types";
import {YModel} from "../yModel";
import {MvcBlockKeyType} from "turbodombuilder";

/**
 * @class YComponent
 * @extends TurboElement
 * @description A general class representing a component attached to a Ywrapped data object. It takes as a
 * generic the datatype of the data that is shared through Yjs. Components that extend this class would ideally
 * include defined callbacks that will be triggered by Thibaut's Ywrapper accordingly when the attached data changes.
 * @template DataType
 */
export class YComponentModel extends YModel<any, YMap, string> {
    protected observeChanges(event: YMapEvent, blockKey?: MvcBlockKeyType<"map">): void {
        event.keysChanged.forEach(key => {
            const change = event.changes.keys.get(key);
            this.fireKeyChangedCallback(key, blockKey, change.action == "delete");
        });
    }
}