import {
    auto,
    define, Reifect,
    Shown,
    StatefulReifect,
    StatefulReifectProperties, StatelessReifectProperties,
    TurboModel,
    TurboSelect,
    TurboSelectEntry,
    TurboSelectProperties,
    TurboView
} from "turbodombuilder";
import "./animatedContentSwitchingDiv.css";
import {getSize} from "../../../../utils/size";

@define("animated-content-switch")
export class AnimatedContentSwitchingDiv<
    ValueType = string,
    SecondaryValueType = string,
    EntryType extends TurboSelectEntry<ValueType, SecondaryValueType> = TurboSelectEntry<ValueType, SecondaryValueType>,
    ViewType extends TurboView = TurboView<any, any>,
    DataType extends object = object,
    ModelType extends TurboModel<DataType> = TurboModel<any>
> extends TurboSelect<ValueType, SecondaryValueType, EntryType, ViewType, DataType, ModelType> {
    private _transitionReifect: StatefulReifect<Shown>;
    private _sizeReifect: Reifect;
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
    }

    public get sizeReifect(): Reifect {
        return this._sizeReifect;
    }

    public set sizeReifect(value: Reifect | StatelessReifectProperties) {
        if (this._sizeReifect) this._sizeReifect.detach(this);

        if (value instanceof Reifect) this._sizeReifect = value;
        else if (typeof value === "object") this._sizeReifect = new Reifect(value);
        else {
            this._sizeReifect = new Reifect({
                transitionProperties: ["width", "height"],
                transitionDuration: this.transitionDuration ?? 0,
                transitionTimingFunction: "ease-out"
            });
        }

        this._sizeReifect.attach(this);
    }

    public select(entry: ValueType | EntryType): this {
        super.select(entry);
        this.entries.forEach(entry => {
            // entry.reifects.attach(this.transitionReifect, this.positionReifect);
            this.transitionReifect?.apply(entry == this.selectedEntry ? Shown.visible : Shown.hidden, entry);
            // this.positionReifect?.apply(entry == this.selectedEntry ? Shown.visible : Shown.hidden, entry);

            entry.setStyle("position", "absolute", true);
        });
        this.refreshSize();
        return this;
    }

    public refreshSize() {
        this.setStyles({transition: "", width: `${this.offsetWidth}px`, height: `${this.offsetHeight}px`}, true);

        this.sizeReifect?.apply();
        const entrySize = getSize(this.selectedEntry);
        this.setStyles({width: `${entrySize.width}px`, height: `${entrySize.height}px`});
    }
}