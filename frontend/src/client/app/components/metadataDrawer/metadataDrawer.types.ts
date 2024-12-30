import {YProxied, YString} from "../../../../yProxy";
import {YMap} from "yjs/dist/src/types/YMap";

export type SyncedCardMetadata = YMap & {
    timestamp?: string,
    description?: string,
    instructions?: string
};