import {BranchingNodeModel} from "../branchingNode/branchingNode.model";
import {SyncedCardMetadata} from "../metadataDrawer/metadataDrawer.types";
import {SyncedClip} from "../clip/clip.types";
import {modelSignal, signal, YArray} from "turbodombuilder";

export class CardModel extends BranchingNodeModel {
    @modelSignal() public title: string;
    @modelSignal() public metadata: SyncedCardMetadata;
    @modelSignal() public syncedClips: YArray<SyncedClip>;

    @signal public duration: number = 0;
}