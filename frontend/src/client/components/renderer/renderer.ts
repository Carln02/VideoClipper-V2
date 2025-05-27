import "./renderer.css";
import {RendererView} from "./renderer.view";
import {RendererModel} from "./renderer.model";
import {RendererProperties} from "./renderer.types";
import {RendererCanvasController} from "./renderer.canvasController";
import {RendererDrawingController} from "./renderer.drawingController";
import {VcComponent} from "../component/component";
import {Project} from "../../screens/project/project";
import {RendererVideoController} from "./renderer.videoController";
import {define} from "turbodombuilder";

@define("vc-renderer")
export class Renderer<
    ViewType extends RendererView = RendererView<any, any>,
    ModelType extends RendererModel = RendererModel
> extends VcComponent<ViewType, object, ModelType, Project> {
    public constructor(properties: RendererProperties<ViewType, ModelType> = {}) {
        super(properties);
        if (properties.generate == false) return;

        this.mvc.generate({
            viewConstructor: RendererView as any,
            modelConstructor: RendererModel as any,
            controllerConstructors: [RendererDrawingController, RendererCanvasController, RendererVideoController],
        });

        this.view.canvas.setProperties(properties.canvasProperties);
        this.view.videos.forEach(video => video.setProperties(properties.videoProperties));
    }

    public get isPlaying(): boolean {
        return this.model.isPlaying;
    }

    public get width() {
        return this.view.width;
    }

    public get height() {
        return this.view.height;
    }

    public get video(): HTMLVideoElement {
        return this.view.video;
    }

    protected get canvasController(): RendererCanvasController {
        return this.mvc.getController("canvas") as RendererCanvasController;
    }

    protected get drawingController(): RendererDrawingController {
        return this.mvc.getController("drawing") as RendererDrawingController;
    }

    public async drawVideoFrame(video: HTMLVideoElement = this.view.video, animate = true): Promise<string> {
        return await this.drawingController.drawVideoFrame(video, animate);
    }

    public setFill(fill?: string | null) {
        this.model.currentCanvasFill = fill;
    }

    public resize(aspectRatio: number = 1.33, width: number = this.offsetWidth, height: number = this.offsetHeight) {
        this.view.resize(aspectRatio, width, height);
    }
}