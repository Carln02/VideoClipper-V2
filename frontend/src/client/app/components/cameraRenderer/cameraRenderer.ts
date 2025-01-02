import {define} from "turbodombuilder";
import "./cameraRenderer.css";
import {Renderer} from "../../abstract/renderer/renderer";
import {CameraRendererView} from "./cameraRenderer.view";
import {CameraRendererModel} from "./cameraRenderer.model";
import {RendererProperties} from "../../abstract/renderer/renderer.types";

@define("vc-camera-renderer")
export class CameraRenderer extends Renderer<CameraRendererView, CameraRendererModel> {
    constructor(properties: RendererProperties<CameraRendererView, CameraRendererModel> = {}) {
        super(properties);
        this.generateViewAndModel(CameraRendererView, CameraRendererModel);
        this.view.canvas.setProperties(properties.canvasProperties);
        this.view.video?.setProperties(properties.videoProperties);
    }
}