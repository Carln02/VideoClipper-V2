import {define} from "turbodombuilder";
import "./cameraRenderer.css";
import {Renderer} from "../renderer/renderer";
import {CameraRendererView} from "./cameraRenderer.view";
import {CameraRendererModel} from "./cameraRenderer.model";
import {RendererProperties} from "../renderer/renderer.types";

@define("vc-camera-renderer")
export class CameraRenderer extends Renderer<CameraRendererView, CameraRendererModel> {
    constructor(properties: RendererProperties<CameraRendererView, CameraRendererModel> = {}) {
        super(properties);
        this.generateMvc(CameraRendererView, CameraRendererModel);
        this.view.canvas.setProperties(properties.canvasProperties);
        this.view.video?.setProperties(properties.videoProperties);
    }

    public async drawCurrentVideoFrame(animate = true): Promise<string> {
        return this.view.drawCurrentVideoFrame(animate);
    }
}