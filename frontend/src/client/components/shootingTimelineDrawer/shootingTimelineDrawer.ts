import {ShootingTimelineDrawerProperties} from "./shootingTimelineDrawer.types";
import {auto, define, Side, TurboDrawer, TurboIconSwitch} from "turbodombuilder";
import "./shootingTimelineDrawer.css";
import {ShootingTimelineDrawerView} from "./shootingTimelineDrawer.view";
import {ShootingTimelineDrawerModel} from "./shootingTimelineDrawer.model";
import {YMap} from "../../../yManagement/yManagement.types";
import {YUtilities} from "../../../yManagement/yUtilities";

@define()
export class ShootingTimelineDrawer extends TurboDrawer<ShootingTimelineDrawerView, ShootingTimelineDrawerModel> {
    public constructor(properties: ShootingTimelineDrawerProperties) {
        super(properties);

        this.mvc.generate({
            viewConstructor: ShootingTimelineDrawerView,
            modelConstructor: ShootingTimelineDrawerModel
        });

        requestAnimationFrame(() => {
            (this.icon as TurboIconSwitch<Side>).switchReifect.apply(this.getOppositeSide());
            requestAnimationFrame(() => (this.icon as TurboIconSwitch<Side>).switchReifect.apply(this.side));
        });
    }
}