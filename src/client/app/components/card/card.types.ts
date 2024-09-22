import {SyncedClip} from "../clip/clip.types";
import {SyncedBranchingNode} from "../branchingNode/branchingNode.types";
import {SyncedCardMetadata} from "../metadataDrawer/metadataDrawer.types";
import {YProxiedArray, YString} from "../../../../yProxy/yProxy";

export type SyncedCard = SyncedBranchingNode & {
    title?: YString,
    syncedClips?: YProxiedArray<SyncedClip>,
    metadata?: SyncedCardMetadata
}