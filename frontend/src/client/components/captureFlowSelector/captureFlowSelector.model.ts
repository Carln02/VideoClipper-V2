import {auto, TurboModel} from "turbodombuilder";

export class CaptureFlowSelectorModel extends TurboModel {
    private timer: NodeJS.Timeout;

    private _hours: number = 0;
    private _minutes: number = 0;
    private _seconds: number = 0;

    @auto()
    public set isTimerShown(value: boolean) {
        this.fireCallback("showTimer", value);
    }

    public get hours(): number {
        return this._hours;
    }

    public get minutes(): number {
        return this._minutes;
    }

    public get seconds(): number {
        return this._seconds;
    }

    public get totalTimeInSeconds(): number {
        return this.hours * 3600 + this.minutes * 60 + this.seconds;
    }

    public incrementTime() {
        this._seconds++;
        if (this.seconds >= 60) {
            this._seconds = 0;
            this._minutes++;
            if (this.minutes >= 60) {
                this._minutes = 0;
                this._hours++;
            }
        }
        this.fireCallback("timeChanged");
    }

    public resetTime() {
        if (this.timer) clearInterval(this.timer);
        this._hours = 0;
        this._minutes = 0;
        this._seconds = 0;
        this.fireCallback("timeChanged");
    }

    public startTimer(resetTime: boolean = true) {
        if (resetTime) this.resetTime();
        else if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => this.incrementTime(), 1000);
    }
}