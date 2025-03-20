import {CameraRenderer} from "./cameraRenderer";
import {CameraRendererView} from "./cameraRenderer.view";
import {RendererDrawingController} from "../renderer/renderer.drawingController";
import {CameraRendererModel} from "./cameraRenderer.model";

export class CameraRendererDrawingController extends RendererDrawingController<CameraRenderer, CameraRendererView,
    CameraRendererModel> {
    public async drawCurrentVideoFrame(animate = true): Promise<string> {
        if (animate) this.view.animateSnapshotEffect();

        return new Promise(resolve => {
            //If offscreen canvas supported
            if (window.OffscreenCanvas) {
                //Create one and get its context
                const offscreen = new OffscreenCanvas(this.view.video.videoWidth, this.view.video.videoHeight);
                const ctx = offscreen.getContext("2d");
                //Draw the frame
                ctx.drawImage(this.view.video, 0, 0, offscreen.width, offscreen.height);
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
                resolve(this.drawFromImageSource(this.view.video));
            }
        });
    }
}