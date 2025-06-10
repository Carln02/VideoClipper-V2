import {
    define, Delegate,
    Shown,
    StatefulReifect,
    StatefulReifectProperties,
    TurboModel,
    TurboView
} from "turbodombuilder";
import {VcComponent} from "../../components/component/component";
import {DirectorProperties} from "./director.types";

@define("vc-director")
export class Director<
    ScreenType extends string | number | symbol = string | number | symbol,
    ViewType extends TurboView = TurboView<any, any>,
    DataType extends object = object,
    ModelType extends TurboModel<DataType> = TurboModel,
    DirectorType extends Director = any
> extends VcComponent<ViewType, DataType, ModelType, DirectorType> {
    private readonly screens: Map<ScreenType, VcComponent> = new Map();

    public screensParent: Node = this;

    private _currentType: ScreenType;
    private _showReifect: StatefulReifect<Shown>;

    /**
     * @description Delegate fired when a tool is changed on a certain click button/mode
     */
    public readonly onScreenChange: Delegate<(oldScreen: VcComponent, newScreen: VcComponent, type: ScreenType) => void>;


    public constructor(properties: DirectorProperties<ScreenType, ViewType, DataType, ModelType, DirectorType>) {
        super(properties);
        this.addClass("director");

        this.onScreenChange = new Delegate<(oldScreen: VcComponent, newScreen: VcComponent, type: ScreenType) => void>();
        this.showReifect = properties.showReifect;
        if (properties.screensParent) this.screensParent = properties.screensParent;
        if (properties.screens) Object.entries(properties.screens).forEach(([key, entry]) => {
            this.addScreen(entry as VcComponent, key as ScreenType);
        });
    }

    public get currentType(): ScreenType {
        return this._currentType;
    }

    public set currentType(value: ScreenType) {
        const oldScreen = this.getScreen(this._currentType);
        const newScreen = this.getScreen(value);

        this._currentType = value;
        this.switchScreens(oldScreen, newScreen);
        this.onScreenChange.fire(oldScreen, newScreen, value);
    }

    public get currentScreen(): VcComponent {
        return this.getScreen(this.currentType);
    }

    public get showReifect(): StatefulReifect<Shown> {
        return this._showReifect;
    }

    public set showReifect(value: StatefulReifect<Shown> | StatefulReifectProperties<Shown>) {
        if (value instanceof StatefulReifect) this._showReifect = value;
        else if (typeof value === "object") this._showReifect = new StatefulReifect(value);
        else this._showReifect = new StatefulReifect<Shown>({
                states: [Shown.visible, Shown.hidden],
                styles: {
                    [Shown.visible]: "opacity: 1; pointer-events: all",
                    [Shown.hidden]: "opacity: 0; pointer-events: none",
                }
            });
    }

    public addScreen(screen: VcComponent, type: ScreenType) {
        this.screens.set(type, screen);
        // this.screensParent.addChild(screen);
        // this.showReifect.apply(Shown.hidden, screen);
    }

    public removeScreen(type: ScreenType) {
        this.screens.get(type)?.remove();
        this.screens.delete(type);
    }

    public getScreen(type: ScreenType): VcComponent {
        return this.screens.get(type);
    }

    protected switchScreens(oldScreen: VcComponent, newScreen: VcComponent) {
        if (oldScreen) oldScreen.remove();
        if (newScreen) this.screensParent.addChild(newScreen);
        return;
        if (oldScreen) this.showReifect.apply(Shown.hidden, oldScreen);
        if (newScreen) this.showReifect.apply(Shown.visible, newScreen);
    }
}