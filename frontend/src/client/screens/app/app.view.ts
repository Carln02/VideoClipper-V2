import {div, TurboView} from "turbodombuilder";
import {AppBar} from "../../components/appBar/appBar";
import {App} from "./app";

export class AppView extends TurboView<App> {
    private appBar: AppBar;
    private content: HTMLElement;

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