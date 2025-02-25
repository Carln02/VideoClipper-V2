import {YMap} from "yjs/dist/src/types/YMap";
import {MetadataDrawerView} from "./metadataDrawer.view";
import {MetadataDrawerModel} from "./metadataDrawer.model";
import {Card} from "../card/card";
import {TurboDrawerProperties} from "turbodombuilder";

export type SyncedCardMetadata = YMap & {
    timestamp?: string,
    description?: string,
    instructions?: string
};

export type MetadataDrawerProperties = TurboDrawerProperties<MetadataDrawerView, SyncedCardMetadata,
    MetadataDrawerModel> & {
    card: Card
}