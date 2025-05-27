
import {define, TurboCustomProperties, TurboElement} from "turbodombuilder";
import "./appBar.css";
import {AppBarView} from "./appBar.view";
import {AppBarModel} from "./appBar.model";

@define("vc-app-bar")
export class AppBar extends TurboElement<AppBarView, object, AppBarModel> {
    constructor(properties: TurboCustomProperties<AppBarView, object, AppBarModel> = {}) {
        super(properties);
        this.mvc.generate({
            viewConstructor: AppBarView,
            modelConstructor: AppBarModel
        });
    }
}