import {SyncedType} from "../../abstract/syncedComponent/syncedComponent.types";

export type SyncedCardMetadataData = {
    timestamp?: string,
    description?: string,
    instructions?: string,
}

export type SyncedCardMetadata = SyncedType<SyncedCardMetadataData>;