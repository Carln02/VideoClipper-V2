import {VcComponent} from "../../components/component/component";
import {define} from "turbodombuilder";
import {VcComponentProperties} from "../../components/component/component.types";
import {AppManager} from "../../managers/appManager/appManager";
import {HomeView} from "./home.view";

@define("vc-home")
export class Home extends VcComponent<HomeView, any, any, AppManager> {
    public constructor(properties: VcComponentProperties<any, any, any, AppManager>) {
        super(properties);

        this.mvc.generate({
            viewConstructor: HomeView,
        });

        this.screenManager.authenticationManager.onLogin.add(this.view.onLogin);
        this.screenManager.groupsManager.onGroupsChanged.add(this.view.generateGroups);
    }
}