import {ShootingTimelineDrawer} from "./shootingTimelineDrawer";
import {ShootingTimelineDrawerModel} from "./shootingTimelineDrawer.model";
import {div, TurboInput, TurboSelect, TurboSelectEntry, TurboView} from "turbodombuilder";
import {
    AnimatedContentSwitchingDiv
} from "../animationComponents/animatedContentSwitchingDiv/animatedContentSwitchingDiv";

export class ShootingTimelineDrawerView extends TurboView<ShootingTimelineDrawer, ShootingTimelineDrawerModel> {
    
    private animationDiv: AnimatedContentSwitchingDiv;

    protected setupUIElements() {
        super.setupUIElements();

    }

    protected setupUILayout() {
        super.setupUILayout();
    }

    public initialize() {
        super.initialize();
    }
}