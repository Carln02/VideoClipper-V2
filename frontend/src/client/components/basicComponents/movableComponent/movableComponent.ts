import {define, Point, TurboElement, TurboProperties} from "turbodombuilder";
import "./movableComponent.css";

@define("movable-component")
export class MovableComponent<T extends Element> extends TurboElement {
    public readonly originElement: T;
    readonly clone: T;

    private _translation: Point;

    constructor(clone: T, originElement: T, properties: TurboProperties = {}) {
        super(properties);
        this.clone = clone;
        this.originElement = originElement;
        this.appendChild(this.clone);
    }

    public get translation() {
        return this._translation;
    }

    public set translation(value: Point) {
        this._translation = value;
        this.setStyle("transform", `translate3d(calc(${value.x}px - 50%), calc(${value.y}px - 50%), 0)`);
    }

    public translateBy(delta: Point) {
        this.translation = this.translation.add(delta);
    }
}