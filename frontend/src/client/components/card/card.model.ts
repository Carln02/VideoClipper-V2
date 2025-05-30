import {BranchingNodeModel} from "../branchingNode/branchingNode.model";
import {SyncedCardMetadata} from "../metadataDrawer/metadataDrawer.types";
import {SyncedClip} from "../clip/clip.types";
import { YArray } from "../../../yManagement/yManagement.types";

export class CardModel extends BranchingNodeModel {
    public get title(): string {
        return this.getData("title") as string;
    }

    public set title(value: string) {
        this.setData("title", value);
    }

    public get metadata(): SyncedCardMetadata {
        return this.getData("metadata") as SyncedCardMetadata;
    }

    public get syncedClips(): YArray<SyncedClip> {
        return this.getData("syncedClips") as YArray<SyncedClip>;
    }
}