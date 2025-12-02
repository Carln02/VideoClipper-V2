import {
    auto,
    define, element,
    OnOff,
    Shown,
    StatefulReifect,
    StatefulReifectProperties, turbo, TurboElement, TurboElementProperties, TurboEmitter, TurboModel, TurboSelect,
    TurboView
} from "turbodombuilder";
import "./animatedContentSwitchingDiv.css";
import {getSize} from "../../../utils/size";

@define("animated-content-switch")
export class AnimatedContentSwitchingDiv<
    ValueType = string,
    SecondaryValueType = string,
    EntryType extends HTMLElement = HTMLElement,
    ViewType extends TurboView = TurboView<any, any>,
    DataType extends object = object,
    ModelType extends TurboModel<DataType> = TurboModel,
    EmitterType extends TurboEmitter = TurboEmitter
> extends TurboElement<ViewType, DataType, ModelType, EmitterType> {
    public readonly selector: TurboSelect<ValueType, SecondaryValueType, EntryType> = new TurboSelect();

    public initialize() {
        this.selector.parent = this;
        this.selector.onEntryAdded = (entry) => {
            this.transitionReifect?.attach(entry);
            this.positionReifect?.attach(entry);
            this.transitionReifect?.initialize(Shown.hidden, entry);
            this.positionReifect?.initialize(Shown.hidden, entry);
        }

        this.selector.onSelectDelegate.add(() => {
            this.selector.entries.forEach(entry => {
                this.transitionReifect?.apply(entry == this.selector.selectedEntry ? Shown.visible : Shown.hidden, entry, {applyStylesInstantly: true});
                this.positionReifect?.apply(entry == this.selector.selectedEntry ? Shown.visible : Shown.hidden, entry, {applyStylesInstantly: true});
            });
            this.refreshSize();
        });

        super.initialize();
    }

    @auto({defaultValue: 0.3})
    public set transitionDuration(value: number) {
        if (this.transitionReifect) this.transitionReifect.transitionDuration = value;
        if (this.sizeReifect) this.sizeReifect.transitionDuration = value;
    }

    @auto({
        setIfUndefined: true,
        preprocessValue: function (value) {return this.generateTransitionReifect(value)}
    }) public get transitionReifect(): StatefulReifect<Shown> {return}

    public set transitionReifect(value: StatefulReifect<Shown> | StatefulReifectProperties<Shown>) {
        this.transitionReifect.attachAll(...this.selector.entries);
    }

    @auto({
        setIfUndefined: true,
        preprocessValue: function (value) {return this.generatePositionReifect(value)}
    }) public get positionReifect(): StatefulReifect<Shown> {return}

    public set positionReifect(value: StatefulReifect<Shown> | StatefulReifectProperties<Shown>) {
        this.positionReifect.attachAll(...this.selector.entries);
    }

    @auto({
        setIfUndefined: true,
        callBefore: function () {this.sizeReifect?.detach(this)},
        preprocessValue: function (value) {return this.generateSizeReifect(value)}
    }) public get sizeReifect(): StatefulReifect<OnOff> {return}

    public set sizeReifect(value: StatefulReifect<OnOff> | StatefulReifectProperties<OnOff>) {
        this.sizeReifect.attach(this);
    }

    public refreshSize() {
        turbo(this).setStyles({
            transition: "",
            width: `${this.offsetWidth}px`,
            height: `${this.offsetHeight}px`
        }, true);

        if (!this.selector.selectedEntry) return;
        this.sizeReifect?.apply(OnOff.on, undefined, {recomputeProperties: true});

        setTimeout(() => this.sizeReifect.apply(OnOff.off), this.transitionDuration);
    }

    private generateTransitionReifect(value: StatefulReifect<Shown> | StatefulReifectProperties<Shown>) {
        if (value instanceof StatefulReifect) return value;
        if (typeof value === "object") return new StatefulReifect<Shown>(value);
        return new StatefulReifect<Shown>({
            states: [Shown.visible, Shown.hidden],
            transitionProperties: ["transform", "opacity"],
            transitionDuration: this.transitionDuration ?? 0,
            transitionTimingFunction: "ease-out",
            styles: {
                [Shown.visible]: {
                    opacity: 1,
                    transform: "translateX(0)",
                    pointerEvents: "all",
                },
                [Shown.hidden]: {
                    opacity: 0,
                    transform: "translateX(100%)",
                    pointerEvents: "none",
                }
            }
        });
    }

    private generatePositionReifect(value: StatefulReifect<Shown> | StatefulReifectProperties<Shown>) {
        if (value instanceof StatefulReifect) return value;
        if (typeof value === "object") return new StatefulReifect<Shown>(value);
        return new StatefulReifect<Shown>({
            states: [Shown.visible, Shown.hidden],
            transitionProperties: ["position"],
            transitionDelay: {
                [Shown.visible]: this.transitionDuration ?? 0,
                [Shown.hidden]: 0
            },
            styles: {
                [Shown.visible]: "position: relative",
                [Shown.hidden]: "position: absolute"
            }
        });
    }

    private generateSizeReifect(value: StatefulReifect<OnOff> | StatefulReifectProperties<OnOff>) {
        if (value instanceof StatefulReifect) return value;
        else if (typeof value === "object") return new StatefulReifect(value);
        return new StatefulReifect<OnOff>({
            states: [OnOff.on, OnOff.off],
            transitionProperties: ["width", "height"],
            transitionDuration: {
                [OnOff.on]: this.transitionDuration,
                [OnOff.off]: 0
            },
            transitionTimingFunction: "ease-out",
            styles: {
                [OnOff.on]: () => {
                    if (!this.selector.selectedEntry) return "";
                    const entrySize = getSize(this.selector.selectedEntry);
                    return {
                        width: entrySize.width > 0 ? `${entrySize.width}px` : "",
                        height: entrySize.height > 0 ? `${entrySize.height}px` : ""
                    };
                },
                [OnOff.off]: {width: `${this.offsetWidth}px`, height: `${this.offsetHeight}px`}
            }
        });
    }
}

export function animatedContentSwitch(properties: TurboElementProperties): AnimatedContentSwitchingDiv {
    turbo(properties).applyDefaults({tag: "animated-content-switch"});
    return element({...properties}) as AnimatedContentSwitchingDiv;
}