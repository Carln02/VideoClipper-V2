import {define, video, div, TurboProperties} from "turbodombuilder";
import "./cameraRenderer.css";
import {Renderer} from "../../abstract/renderer/renderer";

@define("vc-camera-renderer")
export class CameraRenderer extends Renderer {
    public readonly video: HTMLVideoElement;
    private readonly snapshotEffectDiv: HTMLDivElement;

    constructor(properties: TurboProperties = {}, videoProperties: TurboProperties<"video"> = {}) {
        super({id: "card-frame-canvas"}, properties);

        this.video = video({...videoProperties, parent: this});
        this.snapshotEffectDiv = div({id: "snapshot-effect-div", parent: this});

        this.addChild(this.canvasElement);
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

