import {$, auto, callOnce, define, turbo, TurboEventManager, TurboIcon, TurboModel} from "turbodombuilder";
import {CursorManager} from "../../managers/cursorManager/cursorManager";
import {RootDirectorView} from "./rootDirector.view";
import "./rootDirector.css";
import {director, Director} from "../director/director";
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
    private _eventManager: TurboEventManager;
    private _cursorManager: CursorManager;
    private _authenticationHandler: AuthenticationHandler;
    private _groupsHandler: GroupsHandler;

    public initialize(): void {
        super.initialize();
        this._authenticationHandler = new AuthenticationHandler();
        this._eventManager = TurboEventManager.instance;
        this.eventManager.preventDefaultMouse = false;
        this.eventManager.preventDefaultTouch = false;
        this._cursorManager = new CursorManager();
        this._groupsHandler = new GroupsHandler();

        this.authenticationHandler.onLogin.add((loggedIn) => {
            if (loggedIn) this.groupsHandler.loadGroups(this.authenticationHandler.userId);
        });
        this.authenticationHandler.init();
    }

    @callOnce
    public static initialize() {
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
        this.eventManager.preventDefaultTouch = value;
        this.eventManager.preventDefaultMouse = value;
        this.eventManager.preventDefaultWheel = value;
    }
}

export function rootDirector<
    ScreenType extends string | number | symbol = string | number | symbol,
    ViewType extends RootDirectorView = RootDirectorView<any, any>,
    DataType extends object = object,
    ModelType extends TurboModel<DataType> = TurboModel,
>(properties: DirectorProperties<ScreenType, ViewType, DataType, ModelType>
): RootDirector<ScreenType, ViewType, DataType, ModelType> {
    turbo(properties).applyDefaults({tag: "vc-root-director", view: RootDirectorView as new () => ViewType});
    return director({...properties}) as RootDirector<ScreenType, ViewType, DataType, ModelType>;
}