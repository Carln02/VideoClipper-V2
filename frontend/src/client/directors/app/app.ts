import {define} from "turbodombuilder";
import {AppScreens} from "./app.types";
import {RootDirector} from "../rootDirector/rootDirector";
import {DirectorProperties} from "../director/director.types";
import {RootDirectorView} from "../rootDirector/rootDirector.view";
import {Home} from "../../screens/home/home";
import {Project} from "../project/project";

@define("vc-app")
export class App extends RootDirector<AppScreens> {
    public constructor(properties: DirectorProperties<AppScreens, RootDirectorView>) {
        super(properties);

        this.mvc.generate({viewConstructor: RootDirectorView});
        this.addScreen(new Home({director: this}), AppScreens.home);
    }

    public get documentManager(): Project {
        return this.getScreen(AppScreens.document) as Project;
    }
}