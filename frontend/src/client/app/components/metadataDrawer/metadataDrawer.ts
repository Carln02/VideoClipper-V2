import {MetadataDrawerProperties, SyncedCardMetadata} from "./metadataDrawer.types";
import {auto, define, TurboDrawer} from "turbodombuilder";
import "./metadataDrawer.css";
import {Card} from "../card/card";
import {MetadataDrawerView} from "./metadataDrawer.view";
import {MetadataDrawerModel} from "./metadataDrawer.model";

@define()
export class MetadataDrawer extends TurboDrawer<MetadataDrawerView, SyncedCardMetadata, MetadataDrawerModel> {
    constructor(properties: MetadataDrawerProperties) {
        super(properties);

        this.card = properties.card;
        this.mvc.generate({
            viewConstructor: MetadataDrawerView,
            modelConstructor: MetadataDrawerModel,
            data: properties.card ? properties.card.metadata : undefined
        });
    }

    @auto()
    public set card(value: Card) {
        if (this.model) this.data = value.metadata;
    }
}