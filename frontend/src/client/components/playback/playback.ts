import {auto, define} from "turbodombuilder";
import "./playback.css";
import {PlaybackView} from "./playback.view";
import {PlaybackModel} from "./playback.model";
import {Project} from "../../screens/project/project";
import {VcComponent} from "../component/component";
import {Clip} from "../clip/clip";
import {PlaybackProperties} from "./playback.types";
import {FlowPath} from "../flowPath/flowPath";
import {Card} from "../card/card";
import {Timeline} from "../timeline/timeline";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {ProjectScreens} from "../../screens/project/project.types";

@define("vc-playback")
export class Playback extends VcComponent<PlaybackView, object, PlaybackModel, Project> {
    public constructor(properties: PlaybackProperties) {
        super(properties);

        this.mvc.generate({
            viewConstructor: PlaybackView,
            modelConstructor: PlaybackModel
        });
        if (properties.path) this.path = properties.path;
        if (properties.card) this.card = properties.card;
    }

    @auto()
    public set path(value: FlowPath) {
        this.view.timeline.cardIds = value.cardIds;
    }

    @auto()
    public set card(value: Card) {
        this.view.timeline.card = value;
    }

    public get renderer(): ClipRenderer {
        return this.view.renderer;
    }

    public get timeline(): Timeline {
        return this.view.timeline;
    }

    public get frameWidth() {
        return this.view.renderer.offsetWidth;
    }

    public get frameHeight() {
        return this.view.renderer.offsetHeight;
    }

    public fillCanvas(fill?: string | null) {
        this.view.renderer.setFill(fill);
    }

    public clear() {
        this.view.timeline.data = undefined; //TODO idk if gd idea
        this.screenManager.currentType = ProjectScreens.canvas;
    }

    public snapToClip(clip: Clip) {
        if (clip) this.view.timeline.snapToClosest(clip.dataIndex + 1);
        else this.view.timeline.snapAtEnd();
    }
}
