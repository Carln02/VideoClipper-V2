import {auto, callOnce, define, TurboEventManager, turbofy, TurboIcon} from "turbodombuilder";
import {Home} from "../home/home";
import {ScreenManager} from "../screenManager/screenManager";
import {AppScreens} from "./app.types";
import {CursorManager} from "../../managers/cursorManager/cursorManager";
import {AuthenticationManager} from "../../managers/authenticationManager/authenticationManager";
import {GroupManager} from "../../managers/groupsManager/groupsManager";
import {ScreenManagerProperties} from "../screenManager/screenManager.types";
import {Project} from "../project/project";

@define("vc-app")
export class App extends ScreenManager<AppScreens> {
    private readonly _eventManager: TurboEventManager;
    private readonly _cursorManager: CursorManager;
    private readonly _authenticationManager: AuthenticationManager;
    private readonly _groupsManager: GroupManager;

    public constructor(properties: ScreenManagerProperties) {
        super(properties);
        // this._authenticationManager = new AuthenticationManager();
        this._eventManager = new TurboEventManager();
        this._cursorManager = new CursorManager();
        this._groupsManager = new GroupManager();

        this.addScreen(new Home({screenManager: this}), AppScreens.home);
        this.addScreen(new Project({screenManager: this}), AppScreens.document);

        // this.authenticationManager.onLogin.add((loggedIn) => {
        //     if (loggedIn) this.groupsManager.loadGroups(this.authenticationManager.userId);
        // });
        // this.authenticationManager.init();
    }

    @callOnce
    public static initialize() {
        turbofy();
        TurboIcon.config.defaultDirectory = "assets/icons";
        TurboIcon.config.defaultClasses = "icon";
    }

    public get eventManager() {
        return this._eventManager;
    }

    public get cursorManager() {
        return this._cursorManager;
    }

    public get authenticationManager() {
        return this._authenticationManager;
    }

    public get groupsManager() {
        return this._groupsManager;
    }

    public get documentManager(): Project {
        return this.getScreen(AppScreens.document) as Project;
    }

    @auto()
    public set preventDefaultEvents(value: boolean) {
        this.eventManager.defaultState.preventDefaultTouch = value;
        this.eventManager.defaultState.preventDefaultMouse = value;
    }
}