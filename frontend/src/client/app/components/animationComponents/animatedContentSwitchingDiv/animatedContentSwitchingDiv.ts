import {define, TurboElement, TurboProperties} from "turbodombuilder";
import "./animatedContentSwitchingDiv.css";
import {getSize} from "../../../../utils/size";

@define("animated-content-switch")
export class AnimatedContentSwitchingDiv extends TurboElement {
    private _currentChild: HTMLElement | null = null;

    constructor(properties: TurboProperties = {}) {
        super(properties);
        this.init();
    }

    public get currentChild() {
        return this._currentChild;
    }

    private set currentChild(value: HTMLElement | null) {
        this._currentChild = value;
    }

    public init() {
        requestAnimationFrame(() => {
            if (this.children.length > 0) {
                this.switchTo(this.children[0] as HTMLElement);
            } else setTimeout(() => this.init(), 100);
        });
    }

    public switchTo(el: HTMLElement | number) {
        if (typeof el == "number") {
            if (this.children.length <= el) return;
            el = this.children[el] as HTMLElement;
        }
        else if (!Array.from(this.children).includes(el)) return;

        const oldChild = this.currentChild;
        const newChild = el;

        const newChildSize = getSize(newChild);
        this.animateSize(newChildSize.width, newChildSize.height);

        if (oldChild) {
            oldChild.style.opacity = "0";
            oldChild.style.transform = "translateX(100%)";
            oldChild.style.pointerEvents = "none";
        }

        newChild.style.opacity = "1";
        newChild.style.transform = "translateX(0)";
        newChild.style.pointerEvents = "all";

        this.currentChild = newChild;
    }

    private animateSize(newWidth: number, newHeight: number) {
        const oldWidth = this.offsetWidth;
        const oldHeight = this.offsetHeight;

        this.style.width = `${oldWidth}px`;
        this.style.height = `${oldHeight}px`;

        requestAnimationFrame(() => {
            this.style.transition = "width 0.3s ease-out; height 0.3s ease-out";
            this.style.width = `${newWidth}px`;
            this.style.height = `${newHeight}px`;
        });
    }

    public refresh() {
        const newChildSize = getSize(this.currentChild);
        this.animateSize(newChildSize.width, newChildSize.height);
    }
}