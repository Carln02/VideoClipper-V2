import {VcComponent} from "../../components/component/component";
import {define, element, turbo} from "turbodombuilder";
import {VcProperties} from "../../components/component/component.types";
import {HomeView} from "./home.view";
import "./home.css";
import {App} from "../../directors/app/app";

@define("vc-home")
export class Home extends VcComponent<HomeView, any, any, App> {
}

export function home(properties: VcProperties<HomeView, any, any, App> = {}): Home {
    turbo(properties).applyDefaults({tag: "vc-home", view: HomeView});
    return element({...properties}) as Home;
}