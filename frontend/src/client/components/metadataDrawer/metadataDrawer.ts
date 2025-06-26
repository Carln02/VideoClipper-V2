import {MetadataDrawerProperties, SyncedCardMetadata} from "./metadataDrawer.types";
import {auto, define, Side, TurboDrawer, TurboIconSwitch} from "turbodombuilder";
import "./metadataDrawer.css";
import {Card} from "../card/card";
import {MetadataDrawerView} from "./metadataDrawer.view";
import {MetadataDrawerModel} from "./metadataDrawer.model";
import {YMap} from "../../../yManagement/yManagement.types";
import {YUtilities} from "../../../yManagement/yUtilities";

@define()
export class MetadataDrawer extends TurboDrawer<MetadataDrawerView, SyncedCardMetadata, MetadataDrawerModel> {
    public constructor(properties: MetadataDrawerProperties) {
        super(properties);

        this.card = properties.card;
        this.mvc.generate({
            viewConstructor: MetadataDrawerView,
            modelConstructor: MetadataDrawerModel,
            data: properties.card ? properties.card.metadata : undefined
        });

        requestAnimationFrame(() => {
            (this.icon as TurboIconSwitch<Side>).switchReifect.apply(this.getOppositeSide());
            requestAnimationFrame(() => (this.icon as TurboIconSwitch<Side>).switchReifect.apply(this.side));
        });
    }

    public static createData(data?: SyncedCardMetadata): SyncedCardMetadata & YMap {
        return YUtilities.createYMap({});
    }

    @auto()
    public set card(value: Card) {
        if (this.model) this.data = value.metadata;
    }
}