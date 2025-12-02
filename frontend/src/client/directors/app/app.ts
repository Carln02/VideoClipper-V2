import {define, turbo} from "turbodombuilder";
import {AppScreens} from "./app.types";
import {rootDirector, RootDirector} from "../rootDirector/rootDirector";
import {DirectorProperties} from "../director/director.types";
import {RootDirectorView} from "../rootDirector/rootDirector.view";
import {home} from "../../screens/home/home";
import {Project} from "../project/project";

@define("vc-app")
export class App extends RootDirector<AppScreens> {
    public initialize() {
        super.initialize();
        this.addScreen(home({director: this}), AppScreens.home);
    }

    public get documentManager(): Project {
        return this.getScreen(AppScreens.document) as Project;
    }
}

export function app(properties: DirectorProperties<AppScreens, RootDirectorView>): App {
    turbo(properties).applyDefaults({tag: "vc-app"});
    return rootDirector({...properties}) as App;
}