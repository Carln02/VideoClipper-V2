import {RendererView} from "../renderer/renderer.view";
import {CameraRenderer} from "./cameraRenderer";
import {CameraRendererModel} from "./cameraRenderer.model";
import {div, video} from "turbodombuilder";

export class CameraRendererView extends RendererView<CameraRenderer, CameraRendererModel> {
    private snapshotEffectDiv: HTMLDivElement;

    public constructor(element: CameraRenderer, model: CameraRendererModel) {
        super(element, model);
    }

    protected setupUIElements() {
        super.setupUIElements();
        this.video = video();
        this.snapshotEffectDiv = div({classes: "snapshot-effect-div"});
    }

    protected setupUILayout() {
        super.setupUILayout();
        this.element.addChild([this.video, this.snapshotEffectDiv, this.canvas])
    }

    public animateSnapshotEffect() {
        this.snapshotEffectDiv.style.display = "block";
        this.snapshotEffectDiv.style.opacity = "1";

        setTimeout(() => {
            this.snapshotEffectDiv.style.opacity = "0";
            setTimeout(() => this.snapshotEffectDiv.style.display = "none", 50);
        }, 50);
    }

    public async drawCurrentVideoFrame(animate = true): Promise<string> {
        if (animate) this.animateSnapshotEffect();

        return new Promise(resolve => {
            //If offscreen canvas supported
            if (window.OffscreenCanvas) {
                //Create one and get its context
                const offscreen = new OffscreenCanvas(this.video.videoWidth, this.video.videoHeight);
                const ctx = offscreen.getContext("2d");
                //Draw the frame
                ctx.drawImage(this.video, 0, 0, offscreen.width, offscreen.height);
                //Convert to blob
                offscreen.convertToBlob({type: "image/png"}).then(blob => {
                    //Read as data URL
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    //Return data
                    reader.onloadend = () => resolve(reader.result as string);
                });
            }
            //Fallback to actual canvas --> will cause a small lag
            else {
                //Draw frame
                resolve(this.drawFromImageSource(this.video));
            }
        });
    }
}