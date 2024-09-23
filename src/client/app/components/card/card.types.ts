import {SyncedClip, SyncedClipData} from "../clip/clip.types";
import {SyncedBranchingNode, SyncedBranchingNodeData} from "../branchingNode/branchingNode.types";
import {SyncedCardMetadata, SyncedCardMetadataData} from "../metadataDrawer/metadataDrawer.types";
import {YProxiedArray, YString} from "../../../../yProxy";

export type SyncedCardData = SyncedBranchingNodeData & {
    title?: string,
    syncedClips?: SyncedClipData[],
    metadata?: SyncedCardMetadataData
};

export type SyncedCard = SyncedBranchingNode & {
    title?: YString,
    syncedClips?: YProxiedArray<SyncedClip>,
    metadata?: SyncedCardMetadata
};