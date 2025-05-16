import {auto, callOnce, define, TurboEventManager, turbofy, TurboIcon} from "turbodombuilder";
import {CursorManager} from "../cursorManager/cursorManager";
import {ScreenManager} from "../screenManager/screenManager";
import {ScreenManagerProperties} from "../screenManager/screenManager.types";
import {DocumentManager} from "../documentManager/documentManager";
import {AppScreens} from "./appManager.types";
import {AuthenticationManager} from "../authenticationManager/authenticationManager";

@define()
export class AppManager extends ScreenManager<AppScreens> {
    private readonly _eventManager: TurboEventManager;
    private readonly _cursorManager: CursorManager;
    private readonly _authenticationManager: AuthenticationManager;

    public constructor(properties: ScreenManagerProperties) {
        super(properties);
        this._authenticationManager = new AuthenticationManager();
        this._eventManager = new TurboEventManager();
        this._cursorManager = new CursorManager();
        this.addScreen(new DocumentManager({screenManager: this}), AppScreens.document);
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

    public get documentManager(): DocumentManager {
        return this.getScreen(AppScreens.document) as DocumentManager;
    }

    @auto()
    public set preventDefaultEvents(value: boolean) {
        this.eventManager.defaultState.preventDefaultTouch = value;
        this.eventManager.defaultState.preventDefaultMouse = value;
    }
}