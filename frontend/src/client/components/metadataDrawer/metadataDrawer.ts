import {MetadataDrawerProperties, SyncedCardMetadata} from "./metadataDrawer.types";
import {auto, createYMap, define, drawer, turbo, TurboDrawer, YMap} from "turbodombuilder";
import "./metadataDrawer.css";
import {Card} from "../card/card";
import {MetadataDrawerView} from "./metadataDrawer.view";
import {MetadataDrawerModel} from "./metadataDrawer.model";

@define("vc-metadata-drawer")
export class MetadataDrawer extends TurboDrawer<MetadataDrawerView, SyncedCardMetadata, MetadataDrawerModel> {
    public static createData(data?: SyncedCardMetadata): SyncedCardMetadata & YMap {
        return createYMap({});
    }

    @auto()
    public set card(value: Card) {
        if (this.model) this.data = value.metadata;
    }
}

export function metadataDrawer(properties: MetadataDrawerProperties): MetadataDrawer {
    turbo(properties).applyDefaults({
        tag: "vc-metadata-drawer",
        view: MetadataDrawerView,
        model: MetadataDrawerModel,
        data: properties.card ? properties.card.metadata : undefined
    });
    return drawer({...properties}) as MetadataDrawer;
}