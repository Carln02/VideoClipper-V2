import {div, p, Shown, StatefulReifect, TurboDropdown, TurboView} from "turbodombuilder";
import {CaptureFlowSelector} from "./captureFlowSelector";
import {CaptureFlowSelectorModel} from "./captureFlowSelector.model";

export class CaptureFlowSelectorView extends TurboView<CaptureFlowSelector, CaptureFlowSelectorModel> {
    public timerText: HTMLElement;

    private selectorDiv: HTMLElement;
    private flowSelector: TurboDropdown;
    private pathSelector: TurboDropdown;

    protected setupUIElements() {
        this.timerText = p();
        this.selectorDiv = div();
        this.flowSelector = new TurboDropdown({});
        this.pathSelector = new TurboDropdown({});

        const showTransition = new StatefulReifect({
            states: [Shown.visible, Shown.hidden],
            styles: {
                [Shown.visible]: {"display": ""},
                [Shown.hidden]: {"display": "none"},
            }
        });

        this.timerText.showTransition = showTransition;
        this.selectorDiv.showTransition = showTransition;
    }

    protected setupUILayout() {
        this.selectorDiv.addChild([this.flowSelector, p({text: "/"}), this.pathSelector]);
        this.element.addChild([this.timerText, this.selectorDiv]);
    }

    protected setupChangedCallbacks() {
        this.emitter.add("timeChanged", () => this.timerText.textContent =
            `${this.padNumber(this.model.hours)}:${this.padNumber(this.model.minutes)}:${this.padNumber(this.model.seconds)}`);
        this.emitter.add("showTimer", (b: boolean) => {
            this.timerText.show(b);
            this.selectorDiv.show(!b);
            this.element.toggleClass("timer-active", b);
        });
    }

    private padNumber(num: number, length: number = 2): string {
        return num.toString().padStart(length, "0");
    }
}