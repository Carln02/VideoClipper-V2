import {auto, define} from "turbodombuilder";
import "./playback.css";
import {PlaybackView} from "./playback.view";
import {PlaybackModel} from "./playback.model";
import {DocumentManager} from "../../managers/documentManager/documentManager";
import {DocumentScreens} from "../../managers/documentManager/documentManager.types";
import {VcComponent} from "../component/component";
import {Clip} from "../clip/clip";
import {PlaybackProperties} from "./playback.types";
import {FlowPath} from "../flowPath/flowPath";

@define("vc-playback")
export class Playback extends VcComponent<PlaybackView, object, PlaybackModel, DocumentManager> {
    public constructor(properties: PlaybackProperties) {
        super(properties);

        this.mvc.generate({
            viewConstructor: PlaybackView,
            modelConstructor: PlaybackModel
        });
        this.path = properties.path;
    }

    @auto()
    public set path(value: FlowPath) {
        this.view.timeline.cardIds = value.cardIds;
        console.log(value.cardIdsArray)
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
        this.screenManager.currentType = DocumentScreens.canvas;
    }

    public snapToClip(clip: Clip) {
        if (clip) this.view.timeline.snapToClosest(clip.dataIndex + 1);
        else this.view.timeline.snapAtEnd();
    }
}
