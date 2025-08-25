import {define} from "turbodombuilder";
import "./captureFlowSelector.css";
import {Camera} from "../../screens/camera/camera";
import {Card} from "../card/card";
import {CaptureFlowSelectorView} from "./captureFlowSelector.view";
import {CaptureFlowSelectorModel} from "./captureFlowSelector.model";
import {VcComponent} from "../component/component";
import {VcComponentProperties} from "../component/component.types";
import {ProjectScreens} from "../../directors/project/project.types";

@define("vc-capture-flow-selector")
export class CaptureFlowSelector extends VcComponent<CaptureFlowSelectorView, any, CaptureFlowSelectorModel> {
    public constructor(properties: VcComponentProperties<CaptureFlowSelectorView, any, CaptureFlowSelectorModel> = {}) {
        super(properties);
        this.mvc.generate({
            viewConstructor: CaptureFlowSelectorView,
            modelConstructor: CaptureFlowSelectorModel,
            initialize: true
        });
        this.model.isTimerShown = false;
    }

    public get camera(): Camera {
        return this.director.getScreen(ProjectScreens.camera) as Camera;
    }

    public get card(): Card {
        return this.camera.card;
    }

    public startTimer() {
        this.model.isTimerShown = true;
        this.model.startTimer();
    }

    public clearTimer() {
        this.model.resetTime();
    }

    public stopTimer(): number {
        this.model.isTimerShown = false;
        return this.model.totalTimeInSeconds;
    }
}