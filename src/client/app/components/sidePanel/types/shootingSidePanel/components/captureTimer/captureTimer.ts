import {define, div, TurboElement, TurboProperties} from "turbodombuilder";
import "./captureTimer.css";

@define("vc-capture-timer")
export class CaptureTimer extends TurboElement {
    private child: HTMLDivElement;

    private timer: NodeJS.Timeout;

    private hours: number = 0;
    private minutes: number = 0;
    private seconds: number = 0;

    constructor(properties: TurboProperties = {}) {
        super(properties);
        this.child = div({parent: this});
        this.show(false);
    }

    public start() {
        this.clear();
        this.show(true);
        this.timer = setInterval(() => this.incrementTime(), 1000);
    }

    public stop(): number {
        this.show(false);
        const timeSpent = this.hours * 3600 + this.minutes * 60 + this.seconds;
        this.clear();
        return timeSpent;
    }

    private clear() {
        if (this.timer) clearInterval(this.timer);
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        this.setTimeText();
    }
    private incrementTime() {
        this.seconds++;
        if (this.seconds >= 60) {
            this.seconds = 0;
            this.minutes++;
            if (this.minutes >= 60) {
                this.minutes = 0;
                this.hours++;
            }
        }
        this.setTimeText();
    }

    private setTimeText() {
        const pad = (num: number) => num.toString().padStart(2, "0");
        this.child.innerText = `${pad(this.hours)}:${pad(this.minutes)}:${pad(this.seconds)}`;
    }
}