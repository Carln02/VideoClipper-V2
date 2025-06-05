import {auto, callOnce, define, TurboEventManager, turbofy, TurboIcon, TurboModel} from "turbodombuilder";
import {CursorManager} from "../../managers/cursorManager/cursorManager";
import {RootDirectorView} from "./rootDirector.view";
import "./rootDirector.css";
import {Director} from "../director/director";
import {DirectorProperties} from "../director/director.types";
import {AuthenticationHandler} from "../../handlers/authenticationHandler/authenticationHandler";
import {GroupsHandler} from "../../handlers/groupsHandler/groupsHandler";

@define("vc-root-director")
export class RootDirector<
    ScreenType extends string | number | symbol = string | number | symbol,
    ViewType extends RootDirectorView = RootDirectorView<any, any>,
    DataType extends object = object,
    ModelType extends TurboModel<DataType> = TurboModel,
> extends Director<ScreenType, ViewType, DataType, ModelType> {
    private readonly _eventManager: TurboEventManager;
    private readonly _cursorManager: CursorManager;
    private readonly _authenticationHandler: AuthenticationHandler;
    private readonly _groupsHandler: GroupsHandler;

    public constructor(properties: DirectorProperties<ScreenType, ViewType, DataType, ModelType>) {
        super(properties);
        this.addClass("vc-root-director");

        this._authenticationHandler = new AuthenticationHandler();
        this._eventManager = new TurboEventManager();
        this._cursorManager = new CursorManager();
        this._groupsHandler = new GroupsHandler();

        this.authenticationHandler.onLogin.add((loggedIn) => {
            if (loggedIn) this.groupsHandler.loadGroups(this.authenticationHandler.userId);
        });
        this.authenticationHandler.init();
    }

    @callOnce
    public static initialize() {
        turbofy();
        TurboIcon.config.defaultDirectory = "/assets/icons";
        TurboIcon.config.defaultClasses = "icon";
    }

    public get eventManager() {
        return this._eventManager;
    }

    public get cursorManager() {
        return this._cursorManager;
    }

    public get authenticationHandler() {
        return this._authenticationHandler;
    }

    public get groupsHandler() {
        return this._groupsHandler;
    }

    @auto()
    public set preventDefaultEvents(value: boolean) {
        this.eventManager.defaultState.preventDefaultTouch = value;
        this.eventManager.defaultState.preventDefaultMouse = value;
    }
}