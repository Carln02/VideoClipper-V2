import {define} from "turbodombuilder";
import "./cameraRenderer.css";
import {Renderer} from "../renderer/renderer";
import {CameraRendererView} from "./cameraRenderer.view";
import {CameraRendererModel} from "./cameraRenderer.model";
import {RendererProperties} from "../renderer/renderer.types";
import {CameraRendererDrawingController} from "./cameraRenderer.drawingController";
import {RendererCanvasController} from "../renderer/renderer.canvasController";
import {RendererVideoController} from "../renderer/renderer.videoController";

@define("vc-camera-renderer")
export class CameraRenderer extends Renderer<CameraRendererView, CameraRendererModel> {
    public constructor(properties: RendererProperties<CameraRendererView, CameraRendererModel> = {}) {
        super(properties);
        this.mvc.generate({
            viewConstructor: CameraRendererView,
            modelConstructor: CameraRendererModel,
            controllerConstructors: [CameraRendererDrawingController, RendererCanvasController, RendererVideoController],
        });

        this.view.canvas.setProperties(properties.canvasProperties);
        this.view.videos.forEach(video => video.setProperties(properties.videoProperties));
    }
}