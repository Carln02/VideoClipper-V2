import {$, div, Shown, StatefulReifect, turbo, TurboModel, TurboView} from "turbodombuilder";
import {appBar, AppBar} from "../../components/appBar/appBar";
import {RootDirector} from "./rootDirector";

export class RootDirectorView<
    Element extends RootDirector = RootDirector,
    Model extends TurboModel = TurboModel
> extends TurboView<Element, Model> {
    protected appBar: AppBar;
    protected content: HTMLElement;

    protected setupUIElements() {
        super.setupUIElements();
        this.appBar = appBar();
        turbo(this.appBar).showTransition = new StatefulReifect<Shown>({
            states: [Shown.visible, Shown.hidden],
            styles: {
                [Shown.visible]: {"display": ""},
                [Shown.hidden]: {"display": "none"}
            }
        });

        this.content = div();
    }

    protected setupUILayout() {
        super.setupUILayout();
        $(this).addChild([this.appBar, this.content]);
        $(this).childHandler = this.content;
    }

    public showAppBar(shown: boolean) {
        turbo(this.appBar).show(shown);
    }
}