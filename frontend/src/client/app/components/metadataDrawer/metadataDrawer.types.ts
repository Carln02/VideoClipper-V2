import {YProxied, YString} from "../../../../yProxy";
import {YMap} from "yjs/dist/src/types/YMap";
import {MvcTurboProperties} from "../../../../mvc/mvc.types";
import {MetadataDrawerView} from "./metadataDrawer.view";
import {MetadataDrawerModel} from "./metadataDrawer.model";
import {Card} from "../card/card";
import {PanelThumbProperties} from "../basicComponents/panelThumb/panelThumb.types";

export type SyncedCardMetadata = YMap & {
    timestamp?: string,
    description?: string,
    instructions?: string
};

export type MetadataDrawerProperties = MvcTurboProperties<MetadataDrawerView, SyncedCardMetadata,
    MetadataDrawerModel, PanelThumbProperties> & {
    card: Card
}