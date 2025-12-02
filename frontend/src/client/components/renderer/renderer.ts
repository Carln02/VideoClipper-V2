import "./renderer.css";
import {RendererView} from "./renderer.view";
import {RendererModel} from "./renderer.model";
import {RendererProperties} from "./renderer.types";
import {RendererCanvasController} from "./renderer.canvasController";
import {RendererDrawingController} from "./renderer.drawingController";
import {VcComponent} from "../component/component";
import {Project} from "../../directors/project/project";
import {RendererVideoController} from "./renderer.videoController";
import {controller, define, element, expose, turbo, TurboProperties} from "turbodombuilder";

@define("vc-renderer")
export class Renderer<
    ViewType extends RendererView = RendererView<any, any>,
    ModelType extends RendererModel = RendererModel
> extends VcComponent<ViewType, object, ModelType, Project> {
    public canvasProperties: TurboProperties<"canvas">;
    public videoProperties: TurboProperties<"video">;

    @controller() protected canvasController: RendererCanvasController;
    @controller() protected drawingController: RendererDrawingController;

    @expose("model", false) public accessor isPlaying: boolean;
    @expose("model") public currentCanvasFill: string | null;

    @expose("view", false) public accessor width: number;
    @expose("view", false) public accessor height: number;
    @expose("view", false) public accessor video: HTMLVideoElement;

    public async drawVideoFrame(video: HTMLVideoElement = this.view.video, animate = true): Promise<Blob> {
        return await this.drawingController.drawVideoFrame(video, animate);
    }

    public resize(aspectRatio: number = 1.33, width: number = this.offsetWidth, height: number = this.offsetHeight) {
        this.view.resize(aspectRatio, width, height);
    }
}

export function renderer<
    ViewType extends RendererView = RendererView<any, any>,
    ModelType extends RendererModel = RendererModel
>(properties: RendererProperties<ViewType, ModelType> = {}): Renderer<ViewType, ModelType> {
    turbo(properties).applyDefaults({
        tag: "vc-renderer",
        view: RendererView as new () => ViewType,
        model: RendererModel as any,
        controllers: [RendererDrawingController, RendererCanvasController, RendererVideoController],
    });
    return element({...properties}) as Renderer<ViewType, ModelType>;
}