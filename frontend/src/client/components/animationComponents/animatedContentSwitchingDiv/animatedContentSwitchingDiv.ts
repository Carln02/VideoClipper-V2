import {
    auto,
    define,
    OnOff,
    Shown,
    StatefulReifect,
    StatefulReifectProperties,
    TurboModel,
    TurboSelect,
    TurboSelectEntry,
    TurboSelectEntryProperties,
    TurboSelectProperties,
    TurboView
} from "turbodombuilder";
import "./animatedContentSwitchingDiv.css";
import {getSize} from "../../../utils/size";

@define("animated-content-switch")
export class AnimatedContentSwitchingDiv<
    ValueType = string,
    SecondaryValueType = string,
    EntryType extends TurboSelectEntry<ValueType, SecondaryValueType> = TurboSelectEntry<ValueType, SecondaryValueType>,
    ViewType extends TurboView = TurboView<any, any>,
    DataType extends object = object,
    ModelType extends TurboModel<DataType> = TurboModel
> extends TurboSelect<ValueType, SecondaryValueType, EntryType, ViewType, DataType, ModelType> {
    private _transitionReifect: StatefulReifect<Shown>;
    private _sizeReifect: StatefulReifect<OnOff>;
    private _positionReifect: StatefulReifect<Shown>;

    public constructor(properties: TurboSelectProperties<ValueType, SecondaryValueType,
        EntryType, ViewType, DataType, ModelType> = {}) {
        super(properties);

        this.transitionDuration = 0.3;
        this.transitionReifect = undefined;
        this.positionReifect = undefined;
        this.sizeReifect = undefined;
    }


    @auto()
    public set transitionDuration(value: number) {
        if (this.transitionReifect) this.transitionReifect.transitionDuration = value;
        if (this.sizeReifect) this.sizeReifect.transitionDuration = value;
    }

    public get transitionReifect(): StatefulReifect<Shown> {
        return this._transitionReifect;
    }

    public set transitionReifect(value: StatefulReifect<Shown> | StatefulReifectProperties<Shown>) {
        if (value instanceof StatefulReifect) this._transitionReifect = value;
        else if (typeof value === "object") this._transitionReifect = new StatefulReifect<Shown>(value);
        else {
            this._transitionReifect = new StatefulReifect<Shown>({
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

        this.transitionReifect.attachAll(...this.entries);
    }

    public get positionReifect(): StatefulReifect<Shown> {
        return this._positionReifect;
    }

    public set positionReifect(value: StatefulReifect<Shown> | StatefulReifectProperties<Shown>) {
        if (value instanceof StatefulReifect) this._positionReifect = value;
        else if (typeof value === "object") this._positionReifect = new StatefulReifect<Shown>(value);
        else {
            this._positionReifect = new StatefulReifect<Shown>({
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

        this.positionReifect.attachAll(...this.entries);
    }

    public get sizeReifect(): StatefulReifect<OnOff> {
        return this._sizeReifect;
    }

    public set sizeReifect(value: StatefulReifect<OnOff> | StatefulReifectProperties<OnOff>) {
        if (this._sizeReifect) this._sizeReifect.detach(this);

        if (value instanceof StatefulReifect) this._sizeReifect = value;
        else if (typeof value === "object") this._sizeReifect = new StatefulReifect(value);
        else {
            this._sizeReifect = new StatefulReifect<OnOff>({
                states: [OnOff.on, OnOff.off],
                transitionProperties: ["width", "height"],
                transitionDuration: {
                    [OnOff.on]: this.transitionDuration,
                    [OnOff.off]: 0
                },
                transitionTimingFunction: "ease-out",
                styles: {
                    [OnOff.on]: () => {
                        if (!this.selectedEntry) return "";
                        const entrySize = getSize(this.selectedEntry);
                        return {
                            width: entrySize.width > 0 ? `${entrySize.width}px` : "",
                            height: entrySize.height > 0 ? `${entrySize.height}px` : ""
                        };
                    },
                    [OnOff.off]: {width: `${this.offsetWidth}px`, height: `${this.offsetHeight}px`}
                }
            });
        }

        this.sizeReifect.attach(this);
    }

    public addEntry(entry: TurboSelectEntryProperties<ValueType, SecondaryValueType> | ValueType | EntryType): EntryType {
        entry = super.addEntry(entry);
        this.transitionReifect?.attach(entry);
        this.positionReifect?.attach(entry);
        this.transitionReifect?.initialize(Shown.hidden, entry);
        this.positionReifect?.initialize(Shown.hidden, entry);
        return entry;
    }

    public select(entry: ValueType | EntryType): this {
        super.select(entry);
        this.entries.forEach(entry => {
            this.transitionReifect?.apply(entry == this.selectedEntry ? Shown.visible : Shown.hidden, entry, {applyStylesInstantly: true});
            this.positionReifect?.apply(entry == this.selectedEntry ? Shown.visible : Shown.hidden, entry, {applyStylesInstantly: true});
        });
        this.refreshSize();
        return this;
    }

    public refreshSize() {
        this.setStyles({transition: "", width: `${this.offsetWidth}px`, height: `${this.offsetHeight}px`}, true);

        if (!this.selectedEntry) return;
        this.sizeReifect?.apply(OnOff.on, undefined, {recomputeProperties: true});

        // setTimeout(() => this.sizeReifect.apply(OnOff.off), this.transitionDuration);
    }
}