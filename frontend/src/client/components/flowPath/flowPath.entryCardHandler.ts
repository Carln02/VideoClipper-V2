import {TurboHandler} from "turbodombuilder";
import {FlowPathModel} from "./flowPath.model";
import {SyncedFlowEntry} from "../flowEntry/flowEntry.types";
import {YArray} from "../../../yManagement/yManagement.types";
import {YManagerModel} from "../../../yManagement/yModel/types/yManagerModel";

export class FlowPathEntryCardHandler extends TurboHandler<FlowPathModel> {
    protected pushIdIfValid(newData: string[], id: string): boolean {
        if (id === undefined) return false;
        if (newData.length > 0 && newData[newData.length - 1] === id) return false;
        newData.push(id);
        return true;
    }

    public updateCardsModel(entriesModel: YManagerModel<SyncedFlowEntry, void, number, YArray, string, "array">): void {
        const newData: string[] = [];

        entriesModel.getAllBlockKeys().forEach(blockKey => {
            entriesModel.getBlock(blockKey).data.toArray().forEach((entry, id) => {
                this.pushIdIfValid(newData, entry.get("startNodeId"));
                this.pushIdIfValid(newData, entry.get("endNodeId"));
            });
        });

        const cardIds = this.model.cardIds;
        const current = this.model.cardIdsArray;

        let changeStart = 0;
        while (
            changeStart < newData.length &&
            changeStart < current.length &&
            newData[changeStart] === current[changeStart]
            ) {
            changeStart++;
        }

        if (changeStart === newData.length && changeStart === current.length) return;

        cardIds.delete(changeStart, current.length - changeStart);
        cardIds.insert(changeStart, newData.slice(changeStart));
    }
}