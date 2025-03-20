import {ClipRendererVisibility} from "./clipRenderer.types";
import {TurboController} from "turbodombuilder";
import {ClipRenderer} from "./clipRenderer";
import {ClipRendererView} from "./clipRenderer.view";
import {ClipRendererModel} from "./clipRenderer.model";

export class ClipRendererVisibilityController extends TurboController<ClipRenderer, ClipRendererView, ClipRendererModel>{
    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();
        this.emitter.add("reloadVisibility", () => this.reloadVisibility());
    }

    public async reloadVisibility() {
        switch (this.model.visibilityMode) {
            case ClipRendererVisibility.shown:
                this.element.setStyle("opacity", "1");
                this.view.textParent.setStyle("display", "");
                break;
            case ClipRendererVisibility.ghosting:
                this.element.setStyle("opacity", this.model.currentClip.backgroundFill ? "0" : "0.2");
                this.view.textParent.setStyle("display", "none");
                break
            case ClipRendererVisibility.hidden:
                this.element.setStyle("opacity", "0");
                this.view.textParent.setStyle("display", "none");
                break;
        }
    }
}