import {auto, define, element, expose, turbo} from "turbodombuilder";
import "./playback.css";
import {PlaybackView} from "./playback.view";
import {PlaybackModel} from "./playback.model";
import {Project} from "../../directors/project/project";
import {VcComponent} from "../component/component";
import {Clip} from "../clip/clip";
import {PlaybackProperties} from "./playback.types";
import FlowPath from "../flowPath/flowPath";
import {Card} from "../card/card";
import {Timeline} from "../timeline/timeline";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {ProjectScreens} from "../../directors/project/project.types";
import {PlaybackExportController} from "./playback.exportController";

@define("vc-playback")
export class Playback extends VcComponent<PlaybackView, object, PlaybackModel, Project> {
    @expose("view", false) public accessor renderer: ClipRenderer;
    @expose("view", false) public accessor timeline: Timeline;
    @expose("view.renderer") public accessor currentCanvasFill: string | null;

    public initialize(): void {
        super.initialize();
        this.showControlButtons(false);
    }

    @auto() public set path(value: FlowPath) {
        this.view.timeline.cardIds = value.nodeIds;
    }

    @auto() public set card(value: Card) {
        this.view.timeline.card = value;
    }

    public get frameWidth() {
        return this.view.renderer.offsetWidth;
    }

    public get frameHeight() {
        return this.view.renderer.offsetHeight;
    }

    public clear() {
        this.view.timeline.data = undefined;
        this.director.currentType = ProjectScreens.canvas;
    }

    public snapToClip(clip: Clip) {
        if (clip) this.view.timeline.snapToClosest(clip.dataIndex + 1);
        else this.view.timeline.snapAtEnd();
    }

    public showControlButtons(b: boolean) {
        this.view.showControlButtons(b);
    }
}

export function playback(properties: PlaybackProperties): Playback {
    turbo(properties).applyDefaults({
        tag: "vc-playback",
        view: PlaybackView,
        model: PlaybackModel,
        controllers: PlaybackExportController
    });
    return element({...properties}) as Playback;
}
