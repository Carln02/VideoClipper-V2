import {SyncedArray, SyncedType} from "../../abstract/syncedComponent/syncedComponent.types";
import {SyncedClip} from "../clip/clip.types";
import {SyncedBranchingNodeData} from "../branchingNode/branchingNode.types";
import {SyncedCardMetadata} from "../metadataDrawer/metadataDrawer.types";

export type SyncedCardData = SyncedBranchingNodeData & {
    title?: string,
    syncedClips?: SyncedArray<SyncedClip>,
    metadata?: SyncedCardMetadata
}

export type SyncedCard = SyncedType<SyncedCardData>;
