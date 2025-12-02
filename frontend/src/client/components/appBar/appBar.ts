import {define, element, TurboElement, TurboElementProperties} from "turbodombuilder";
import "./appBar.css";
import {AppBarView} from "./appBar.view";

@define("vc-app-bar")
export class AppBar extends TurboElement<AppBarView> {
}

export function appBar(properties: TurboElementProperties<AppBarView> = {}): AppBar {
    if (!properties.tag) properties.tag = "vc-app-bar";
    if (!properties.view) properties.view = AppBarView;
    return element({...properties}) as AppBar;
}