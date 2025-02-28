import {MetadataDrawerProperties, SyncedCardMetadata} from "./metadataDrawer.types";
import {define} from "turbodombuilder";
import "./metadataDrawer.css";
import {Card} from "../card/card";
import {MetadataDrawerView} from "./metadataDrawer.view";
import {MetadataDrawerModel} from "./metadataDrawer.model";
import {TurboDrawer} from "../drawer/drawer";

@define()
export class MetadataDrawer extends TurboDrawer<MetadataDrawerView, SyncedCardMetadata, MetadataDrawerModel> {
    private readonly _card: Card;

    constructor(properties: MetadataDrawerProperties) {
        super(properties);

        this._card = properties.card;
        this.generateMvc(MetadataDrawerView, MetadataDrawerModel, properties.card.metadata);
    }

    public get card() {
        return this._card;
    }
}