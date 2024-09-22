import {YProxied, YString} from "../../../../yProxy/yProxy/types/proxied.types";

export type SyncedCardMetadata = YProxied<{
    timestamp?: YString,
    description?: YString,
    instructions?: YString
}>