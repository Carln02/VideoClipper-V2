import {div, TurboModel, TurboView} from "turbodombuilder";
import {AppBar} from "../../components/appBar/appBar";
import {RootDirector} from "./rootDirector";

export class RootDirectorView<
    Element extends RootDirector = RootDirector,
    Model extends TurboModel = TurboModel
> extends TurboView<Element, Model> {
    protected appBar: AppBar;
    protected content: HTMLElement;

    protected setupUIElements() {
        super.setupUIElements();
        this.appBar = new AppBar();
        this.content = div();
    }

    protected setupUILayout() {
        super.setupUILayout();
        this.element.addChild([this.appBar, this.content]);
        this.element.childHandler = this.content;
    }
}