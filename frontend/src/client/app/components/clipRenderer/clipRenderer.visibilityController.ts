import {ClipRendererVisibility} from "./clipRenderer.types";
import {StatefulReifect, TurboController} from "turbodombuilder";
import {ClipRenderer} from "./clipRenderer";
import {ClipRendererView} from "./clipRenderer.view";
import {ClipRendererModel} from "./clipRenderer.model";

export class ClipRendererVisibilityController extends TurboController<ClipRenderer, ClipRendererView, ClipRendererModel> {
    public elementVisibilityReifect: StatefulReifect<ClipRendererVisibility> = new StatefulReifect<ClipRendererVisibility>({
        states: [ClipRendererVisibility.hidden, ClipRendererVisibility.shown, ClipRendererVisibility.ghosting],
        styles: {
            [ClipRendererVisibility.shown]: "opacity: 1",
            [ClipRendererVisibility.hidden]: "opacity: 0",
            [ClipRendererVisibility.ghosting]: "opacity: 0.2",
        }
    });

    public canvasVisibilityReifect: StatefulReifect<ClipRendererVisibility> = new StatefulReifect<ClipRendererVisibility>({
        states: [ClipRendererVisibility.hidden, ClipRendererVisibility.shown, ClipRendererVisibility.ghosting],
        styles: (state) => state == ClipRendererVisibility.shown ? "display: inherit" : "display: none"
    });

    public textVisibilityReifect: StatefulReifect<ClipRendererVisibility> = new StatefulReifect<ClipRendererVisibility>({
        states: [ClipRendererVisibility.hidden, ClipRendererVisibility.shown, ClipRendererVisibility.ghosting],
        styles: (state) => state == ClipRendererVisibility.shown ? "display: inherit" : "display: none"
    });

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();
        this.elementVisibilityReifect.attach(this.element);
        this.canvasVisibilityReifect.attach(this.view.canvas);
        this.textVisibilityReifect.attach(this.view.textParent);
        this.emitter.add("reloadVisibility", () => this.reloadVisibility());
    }

    public async reloadVisibility() {
        this.elementVisibilityReifect.apply(this.model.visibilityMode);
        this.canvasVisibilityReifect.apply(this.model.visibilityMode);
        this.textVisibilityReifect.apply(this.model.visibilityMode);
    }
}