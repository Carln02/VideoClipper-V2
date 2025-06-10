import {
    auto,
    define,
    TurboDragEvent,
    TurboEventName,
} from "turbodombuilder";
import "./scrubber.css";
import {ScrubberProperties} from "./scrubber.types";
import {Timeline} from "../timeline/timeline";
import {VcComponent} from "../component/component";
import {Project} from "../../directors/project/project";

@define("vc-scrubber")
export class Scrubber extends VcComponent<any, any, any, Project> {
    //The timeline it is attached to
    public readonly timeline: Timeline;

    public scaled: boolean = false;

    //Whether it is currently scrubbing (fired by the user's action)
    private scrubbing: boolean = false;

    public onScrubbingStart: (e: TurboDragEvent) => void;
    public onScrubbing: (e: TurboDragEvent) => void;
    public onScrubbingEnd: (e: TurboDragEvent) => void;

    public constructor(properties: ScrubberProperties = {}) {
        super(properties);
        this.addClass("vc-scrubber");

        this.timeline = properties.timeline;
        this.scaled = properties.scaled ?? true;
        if (properties.initialize) this.initializeUI();
    }

    protected setupUIListeners() {
        super.setupUIListeners();

        //Drag start --> start scrubbing and stop propagation
        this.addListener(TurboEventName.dragStart, (e: TurboDragEvent) => {
            e.stopImmediatePropagation();
            this.scrubbing = true;
            if (this.onScrubbingStart) this.onScrubbingStart(e);
        });

        //On drag and if scrubbing --> stop propagation and move scrubber by delta position
        document.addListener(TurboEventName.drag, (e: TurboDragEvent) => {
            if (!this.scrubbing) return;
            e.stopImmediatePropagation();
            if (this.onScrubbing) this.onScrubbing(e);
        });

        //Drag end and if scrubbing --> end scrubbing and stop propagation
        document.addListener(TurboEventName.dragEnd, (e: TurboDragEvent) => {
            if (!this.scrubbing) return;
            this.scrubbing = false;
            if (this.onScrubbingEnd) this.onScrubbingEnd(e);
        });
    }

    /**
     * @description Translation value of the scrubber, in relation to the timeline container's dimensions.
     */
    @auto()
    public set translation(value: number) {
        const basis = this.scaled ? this.director.canvas.scale : 1;
        this.style.transform = `translate(calc(${value / basis}px - 50%), 0)`;
    }
}
