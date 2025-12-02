import {auto, define, element, Point, turbo, TurboElement} from "turbodombuilder";
import "./movableComponent.css";
import {MovableComponentProperties} from "./movableComponent.types";

@define("vc-movable-component")
export class MovableComponent<Type extends Element> extends TurboElement {
    public originElement: Type;
    public clone: Type;

    protected setupUILayout() {
        super.setupUILayout();
        turbo(this).addChild(this.clone);
    }

    @auto() public set translation(value: Point) {
        turbo(this).setStyle("transform", `translate3d(calc(${value.x}px - 50%), calc(${value.y}px - 50%), 0)`);
    }

    public translateBy(delta: Point) {
        this.translation = this.translation.add(delta);
    }
}

export function movable<Type extends Element>(properties: MovableComponentProperties<Type> = {}): MovableComponent<Type> {
    turbo(properties).applyDefaults({tag: "vc-movable-component"});
    return element({...properties}) as MovableComponent<Type>;
}