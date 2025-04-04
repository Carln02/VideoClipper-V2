import {SyncedClip} from "../clip/clip.types";
import {SyncedBranchingNode} from "../branchingNode/branchingNode.types";
import {SyncedCardMetadata} from "../metadataDrawer/metadataDrawer.types";
import { YArray } from "../../../../yManagement/yManagement.types";

export type SyncedCard = SyncedBranchingNode & {
    title?: string,
    syncedClips?: YArray<SyncedClip> | SyncedClip[],
    metadata?: SyncedCardMetadata
};