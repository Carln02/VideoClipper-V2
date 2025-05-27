import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {ClipModel} from "./clip.model";
import {Clip} from "./clip";
import {TurboController} from "turbodombuilder";
import {ClipView} from "./clip.view";

export class ClipThumbnailController extends TurboController<Clip, ClipView, ClipModel>{
    private static renderer: ClipRenderer;
    private static rendererInitialized = false;

    private thumbnailTimer: NodeJS.Timeout;

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();
        this.emitter.add("reload_thumbnail", () => {
            if (this.thumbnailTimer) clearTimeout(this.thumbnailTimer);
            this.thumbnailTimer = setTimeout(() => {
                this.reloadThumbnail();
                this.thumbnailTimer = null;
            }, 600);
        });
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
            id: "snapshot-renderer",
            videoProperties: {muted: true, playsInline: true}
        });
        document.body.addChild(ClipThumbnailController.renderer);
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
        const image = await ClipThumbnailController.renderer.drawFrame(this.element, offset);
        this.model.thumbnail = image;
        return image;
    }
}