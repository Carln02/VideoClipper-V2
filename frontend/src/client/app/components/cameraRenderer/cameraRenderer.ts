import {define, TurboProperties} from "turbodombuilder";
import "./cameraRenderer.css";
import {Renderer} from "../../abstract/renderer/renderer";
import {CameraRendererView} from "./cameraRenderer.view";
import {CameraRendererModel} from "./cameraRenderer.model";

@define("vc-camera-renderer")
export class CameraRenderer extends Renderer<CameraRendererView, CameraRendererModel> {
    constructor(properties: TurboProperties = {}, videoProperties: TurboProperties<"video"> = {}) {
        super(properties);
        this.model = new CameraRendererModel();
        this.view = new CameraRendererView(this);
        this.view.canvas.setProperties({id: "card-frame-canvas"});
        this.view.video?.setProperties(videoProperties);
    }
}