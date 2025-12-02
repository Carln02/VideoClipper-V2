import {
    $,
    define, Delegate, element, PartialRecord,
    Shown,
    StatefulReifect,
    StatefulReifectProperties, turbo,
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
    private readonly screensMap: Map<ScreenType, VcComponent> = new Map();

    public screensParent: Node = this;

    private _currentType: ScreenType;
    private _showReifect: StatefulReifect<Shown>;

    /**
     * @description Delegate fired when a tool is changed on a certain click button/mode
     */
    public readonly onScreenChange: Delegate<(oldScreen: VcComponent, newScreen: VcComponent, type: ScreenType) => void> = new Delegate();

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

    public set screens(value: PartialRecord<ScreenType, VcComponent>) {
        Object.entries(value).forEach(([key, entry]) =>
            this.addScreen(entry as VcComponent, key as ScreenType));
    }

    public addScreen(screen: VcComponent, type: ScreenType) {
        this.screensMap.set(type, screen);
        // this.screensParent.addChild(screen);
        // this.showReifect.apply(Shown.hidden, screen);
    }

    public removeScreen(type: ScreenType) {
        this.screensMap.get(type)?.remove();
        this.screensMap.delete(type);
    }

    public getScreen(type: ScreenType): VcComponent {
        return this.screensMap.get(type);
    }

    protected switchScreens(oldScreen: VcComponent, newScreen: VcComponent) {
        if (oldScreen) oldScreen.remove();
        if (newScreen) $(this.screensParent).addChild(newScreen);
        return;
        if (oldScreen) this.showReifect.apply(Shown.hidden, oldScreen);
        if (newScreen) this.showReifect.apply(Shown.visible, newScreen);
    }
}

export function director<
    ScreenType extends string | number | symbol = string | number | symbol,
    ViewType extends TurboView = TurboView<any, any>,
    DataType extends object = object,
    ModelType extends TurboModel<DataType> = TurboModel,
    DirectorType extends Director = any
>(
    properties: DirectorProperties<ScreenType, ViewType, DataType, ModelType, DirectorType>
): Director<ScreenType, ViewType, DataType, ModelType, DirectorType> {
    turbo(properties).applyDefaults({tag: "vc-director"});
    return element({...properties}) as Director<ScreenType, ViewType, DataType, ModelType, DirectorType>;
}