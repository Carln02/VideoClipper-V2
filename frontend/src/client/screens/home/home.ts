import {VcComponent} from "../../components/component/component";
import {define} from "turbodombuilder";
import {VcComponentProperties} from "../../components/component/component.types";
import {HomeView} from "./home.view";
import {App} from "../app/app";
import "./home.css";

@define("vc-home")
export class Home extends VcComponent<HomeView, any, any, App> {
    public constructor(properties: VcComponentProperties<any, any, any, App>) {
        super(properties);

        this.mvc.generate({
            viewConstructor: HomeView,
        });

        this.screenManager.authenticationManager.onLogin.add(this.view.onLogin);
        this.screenManager.groupsManager.onGroupsChanged.add(this.view.generateGroups);
    }
}