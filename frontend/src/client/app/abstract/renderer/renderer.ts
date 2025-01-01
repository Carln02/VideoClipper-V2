import {Shown, StatefulReifect, TurboProperties} from "turbodombuilder";
import "./renderer.css";
import {YComponent} from "../../../../yManagement/yMvc/yComponent";
import {RendererView} from "./renderer.view";
import {RendererModel} from "./renderer.model";

export abstract class Renderer<
    ViewType extends RendererView = RendererView<any, any>,
    ModelType extends RendererModel = RendererModel<any>
> extends YComponent<ViewType, ModelType> {
    private static rendererShowTransition: StatefulReifect<Shown> = new StatefulReifect<Shown>({
        properties: "opacity",
        styles: {visible: 1, hidden: 0},
        states: [Shown.visible, Shown.hidden]
    });

    protected constructor(properties: TurboProperties = {}) {
        super(properties);
        this.addClass("vc-renderer");
        this.showTransition = Renderer.rendererShowTransition;
    }

    public get width() {
        return this.view.width;
    }

    public get height() {
        return this.view.height;
    }
}