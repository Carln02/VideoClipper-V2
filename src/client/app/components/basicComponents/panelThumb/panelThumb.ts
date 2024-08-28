import {Direction, PanelThumbProperties} from "./panelThumb.types";
import {
    DefaultEventName,
    define,
    icon,
    Point,
    TurboDragEvent,
    TurboElement,
    TurboEventName,
    TurboIcon
} from "turbodombuilder";
import "./panelThumb.css";

@define("panel-thumb")
export class PanelThumb extends TurboElement {
    private panel: HTMLElement;
    private icon: TurboIcon;

    private dragging: boolean = false;

    private _open: boolean;
    private _translation: number = 0;

    private _direction: Direction;
    private readonly fitSizeOf: HTMLElement = null;

    private readonly closedOffset: number = 0;
    private readonly openOffset: number = 0;

    private readonly invertOpenAndClosedValues: boolean = false;

    private animationOn: boolean = false;

    constructor(properties: PanelThumbProperties) {
        super(properties);

        this.direction = properties.direction || Direction.top;
        if (properties.fitSizeOf) this.fitSizeOf = properties.fitSizeOf;

        if (properties.closedOffset) this.closedOffset = properties.closedOffset;
        if (properties.openOffset) this.openOffset = properties.openOffset;
        if (properties.invertOpenAndClosedValues) this.invertOpenAndClosedValues = properties.invertOpenAndClosedValues;

        if (properties.panel) {
            this.panel = properties.panel;
            requestAnimationFrame(() => this.initState(properties.initiallyClosed));
        }

        this.icon = icon({icon: this.getIcon(), parent: this});
        this.initEvents();
    }

    private initEvents() {
        this.addEventListener(DefaultEventName.click, (e) => {
            e.stopImmediatePropagation();
            this.open = !this.open;
        });

        this.addEventListener(TurboEventName.dragStart, (e: TurboDragEvent) => {
            e.stopImmediatePropagation();
            this.dragging = true;
            this.enableTransition(false);
        });

        this.addEventListener(TurboEventName.drag, (e: TurboDragEvent) => {
            if (!this.dragging) return;
            e.stopImmediatePropagation();
            this.translateBy(e.scaledDeltaPosition);
        });

        this.addEventListener(TurboEventName.dragEnd, (e: TurboDragEvent) => {
            if (!this.dragging) return;
            e.stopImmediatePropagation();
            this.dragging = false;
            const delta = e.positions.first.sub(e.origins.first);
            switch (this.direction) {
                case Direction.top:
                    if (this.open && delta.y < -100) this.open = false;
                    else if (!this.open && delta.y > 100) this.open = true;
                    break;
                case Direction.bottom:
                    if (this.open && delta.y > 100) this.open = false;
                    else if (!this.open && delta.y < -100) this.open = true;
                    break;
                case Direction.left:
                    if (this.open && delta.x > 100) this.open = false;
                    else if (!this.open && delta.x < -100) this.open = true;
                    break;
                case Direction.right:
                    if (this.open && delta.x < -100) this.open = false;
                    else if (!this.open && delta.x > 100) this.open = true;
                    break;
            }
            this.refresh();
        });
    }

    private initState(isClosed: boolean) {
        if (this.fitSizeOf) {
            switch (this.direction) {
                case Direction.top:
                    this.panel.style.top = this.offsetHeight + "px";
                    break;
                case Direction.bottom:
                    this.panel.style.bottom = this.offsetHeight + "px";
                    break;
                case Direction.right:
                    this.panel.style.right = this.offsetWidth + "px";
                    break
                case Direction.left:
                    this.panel.style.left = this.offsetWidth + "px";
                    break;
            }
        }
        this.open = !isClosed;
        this.animationOn = true;
    }

    public get direction() {
        return this._direction;
    }

    public set direction(value: Direction) {
        this._direction = value;
        this.toggleClass("top-thumb", value == Direction.top);
        this.toggleClass("bottom-thumb", value == Direction.bottom);
        this.toggleClass("left-thumb", value == Direction.left);
        this.toggleClass("right-thumb", value == Direction.right);
    }

    public get isVertical() {
        return this.direction == Direction.top || this.direction == Direction.bottom;
    }

    public get open() {
        return this._open;
    }

    public set open(value: boolean) {
        this._open = value;
        this.enableTransition(true);
        requestAnimationFrame(() => {
            const translationAmount = (value && !this.invertOpenAndClosedValues || !value && this.invertOpenAndClosedValues)
                ? (this.isVertical ? this.panel.offsetHeight : this.panel.offsetWidth) : 0;
            this.translation = translationAmount + (!value ? this.closedOffset : this.openOffset);
           this.icon.icon = this.getIcon();
        });
    }

    public get translation(): number {
        return this._translation;
    }

    private set translation(value: number) {
        this._translation = value;
        switch (this.direction) {
            case Direction.top:
                if (this.fitSizeOf) this.fitSizeOf.style.height = value + this.offsetHeight + "px";
                else this.panel.style.transform = `translate(-50%, ${value}px)`;
                break;
            case Direction.bottom:
                if (this.fitSizeOf) this.fitSizeOf.style.height = value + this.offsetHeight + "px";
                else this.panel.style.transform = `translate(-50%, -${value}px)`;
                break;
            case Direction.left:
                if (this.fitSizeOf) this.fitSizeOf.style.width = value + this.offsetWidth + "px";
                else this.panel.style.transform = `translate(-${value}px, -50%)`;
                break;
            case Direction.right:
                if (this.fitSizeOf) this.fitSizeOf.style.width = value + this.offsetWidth + "px";
                else this.panel.style.transform = `translate(${value}px, -50%)`;
                break;
        }
    }

    private translateBy(delta: Point) {
        switch (this.direction) {
            case Direction.top:
                this.translation += delta.y;
                break;
            case Direction.bottom:
                this.translation -= delta.y;
                break;
            case Direction.left:
                this.translation -= delta.x;
                break;
            case Direction.right:
                this.translation += delta.x;
                break;
        }
    }

    public refresh() {
        this.open = this.open;
    }

    private getIcon(): string {
        if ((this.open && this.direction == Direction.top) || (!this.open && this.direction == Direction.bottom)) {
            return "chevron-bottom";
        } else if ((!this.open && this.direction == Direction.top) || (this.open && this.direction == Direction.bottom)) {
            return "chevron-top";
        } else if ((this.open && this.direction == Direction.right) || (!this.open && this.direction == Direction.left)) {
            return "chevron-left";
        } else {
            return "chevron-right";
        }
    }

    private enableTransition(b: boolean) {
        if (!this.animationOn) return;
        if (this.fitSizeOf) {
            this.fitSizeOf.style.transition = b ? `${this.isVertical ? "height" : "width"} 0.2s ease-out` : "";
        }
        else this.panel.style.transition = b ? "transform 0.2s ease-out" : "";
    }
}