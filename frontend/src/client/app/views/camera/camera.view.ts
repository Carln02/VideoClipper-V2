import {TurboView} from "turbodombuilder";
import {Camera} from "./camera";
import {CameraModel} from "./camera.model";
import {CameraRenderer} from "../../components/cameraRenderer/cameraRenderer";
import {ClipRenderer} from "../../components/clipRenderer/clipRenderer";
import {Toolbar} from "../../components/toolbar/toolbar";
import {SidePanel} from "../../components/sidePanel/sidePanel";
import {Timeline} from "../../components/timeline/timeline";
import {MetadataDrawer} from "../../components/metadataDrawer/metadataDrawer";
import {ToolType} from "../../managers/toolManager/toolManager.types";

export class CameraView extends TurboView<Camera, CameraModel> {
    private cameraRenderer: CameraRenderer;
    private clipRenderer: ClipRenderer;

    private toolbar: Toolbar;
    public sidePanel: SidePanel;
    private timeline: Timeline;
    private metadataDrawer: MetadataDrawer;

    protected setupUIElements() {
        super.setupUIElements();

        this.cameraRenderer = new CameraRenderer({videoProperties: {autoplay: true, muted: true, playsInline: true}});
        this.clipRenderer = new ClipRenderer({videoProperties: {playsInline: true}});

        this.sidePanel = new SidePanel(this.element, this.captureManager);

        this.toolbar = new Toolbar({classes: "left-toolbar"});
        this.toolbar.populateWith(ToolType.selection, ToolType.shoot, ToolType.text, ToolType.delete);
    }
}