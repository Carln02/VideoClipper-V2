import {YProxied, YString} from "../../../../yProxy";

export type SyncedCardMetadataData = {
    timestamp?: string,
    description?: string,
    instructions?: string
};

export type SyncedCardMetadata = YProxied<{
    timestamp?: YString,
    description?: YString,
    instructions?: YString
}>;