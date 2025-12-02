import {
    auto,
    define,
    Direction, element, turbo,
    TurboDragEvent,
    TurboEventName,
} from "turbodombuilder";
import "./scrubber.css";
import {Timeline} from "../timeline/timeline";
import {VcComponent} from "../component/component";
import {Project} from "../../directors/project/project";
import {ScrubberProperties} from "./scrubber.types";

@define("vc-scrubber")
export class Scrubber extends VcComponent<any, any, any, Project> {
    //The timeline it is attached to
    public readonly timeline: Timeline;

    public scaled: boolean = true;

    //Whether it is currently scrubbing (fired by the user's action)
    private scrubbing: boolean = false;

    public onScrubbingStart: (e: TurboDragEvent) => void;
    public onScrubbing: (e: TurboDragEvent) => void;
    public onScrubbingEnd: (e: TurboDragEvent) => void;

    protected setupUIListeners() {
        super.setupUIListeners();

        //Drag start --> start scrubbing and stop propagation
        turbo(this).on(TurboEventName.dragStart, (e: TurboDragEvent) => {
            e.stopImmediatePropagation();
            this.scrubbing = true;
            if (this.onScrubbingStart) this.onScrubbingStart(e);
        });

        //On drag and if scrubbing --> stop propagation and move scrubber by delta position
        turbo(this).on(TurboEventName.drag, (e: TurboDragEvent) => {
            if (!this.scrubbing) return;
            e.stopImmediatePropagation();
            if (this.onScrubbing) this.onScrubbing(e);
            return true;
        });

        //Drag end and if scrubbing --> end scrubbing and stop propagation
        turbo(this).on(TurboEventName.dragEnd, (e: TurboDragEvent) => {
            if (!this.scrubbing) return;
            this.scrubbing = false;
            if (this.onScrubbingEnd) this.onScrubbingEnd(e);
            return true;
        });
    }

    /**
     * @description Translation value of the scrubber, in relation to the timeline container's dimensions.
     */
    @auto()
    public set translation(value: number) {
        const basis = this.scaled ? this.director.canvas.scale : 1;
        if (this.orientation == Direction.horizontal)
            this.style.transform = `translate(0, calc(${value / basis}px - 50%))`;
        else
            this.style.transform = `translate(calc(${value / basis}px - 50%), 0)`;
    }

    @auto()
    public set orientation(value: Direction) {
        turbo(this).toggleClass("vc-scrubber-v", value === Direction.vertical)
            .toggleClass("vc-scrubber-h", value === Direction.horizontal);
    }
}

export function scrubber(properties: ScrubberProperties): Scrubber {
    turbo(properties).applyDefaults({tag: "vc-scrubber"});
    return element({...properties}) as Scrubber;
}
