import {RendererView} from "../renderer/renderer.view";
import {CameraRenderer} from "./cameraRenderer";
import {CameraRendererModel} from "./cameraRenderer.model";
import {div, video} from "turbodombuilder";

export class CameraRendererView extends RendererView<CameraRenderer, CameraRendererModel> {
    private snapshotEffectDiv: HTMLDivElement;

    protected setupUIElements() {
        super.setupUIElements();
        for (let i = 0; i < this.model.videoElementsCount; i++) this.videos.push(video());
        this.snapshotEffectDiv = div({classes: "snapshot-effect-div"});
    }

    protected setupUILayout() {
        super.setupUILayout();
        this.element.addChild([...this.videos, this.snapshotEffectDiv, this.canvas])
    }

    public animateSnapshotEffect() {
        this.snapshotEffectDiv.style.display = "block";
        this.snapshotEffectDiv.style.opacity = "1";

        setTimeout(() => {
            this.snapshotEffectDiv.style.opacity = "0";
            setTimeout(() => this.snapshotEffectDiv.style.display = "none", 50);
        }, 50);
    }
}