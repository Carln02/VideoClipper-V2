import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {ClipModel} from "./clip.model";
import {Clip} from "./clip";
import {TurboController} from "turbodombuilder";
import {ClipView} from "./clip.view";

export class ClipThumbnailController extends TurboController<Clip, ClipView, ClipModel>{
    private static renderer: ClipRenderer;
    private static rendererInitialized = false;

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();
        this.emitter.add("__reload_thumbnail", () => this.reloadThumbnail());
    }

    /**
     * @function initializeSnapshotRenderer
     * @private
     * @static
     * @description If not already created, creates a new static renderer used to take snapshots of clips and generate
     * thumbnails.
     */
    private initializeSnapshotRenderer() {
        if (ClipThumbnailController.rendererInitialized) return;
        ClipThumbnailController.renderer = new ClipRenderer({
            screenManager: this.element.screenManager,
            parent: document.body,
            id: "snapshot-renderer",
            videoProperties: {muted: true, playsInline: true}
        });
        ClipThumbnailController.rendererInitialized = true;
    }

    /**
     * @function reloadThumbnail
     * @async
     * @description Regenerates the thumbnail of the current clip.
     * @param {number} [offset] - Optionally specify the timestamp from which the thumbnail should be generated.
     * @returns {Promise<string>} - A base64 string of the image output.
     */
    public async reloadThumbnail(offset: number = 0): Promise<string> {
        this.initializeSnapshotRenderer();
        const image = await ClipThumbnailController.renderer.drawFrame(offset);
        this.model.thumbnail = image;
        return image;
    }
}