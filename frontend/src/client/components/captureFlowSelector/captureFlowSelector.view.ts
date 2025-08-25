import {
    Direction,
    div,
    p,
    Shown,
    StatefulReifect,
    TurboSelectEntry,
    TurboSelectWheel,
    TurboView
} from "turbodombuilder";
import {CaptureFlowSelector} from "./captureFlowSelector";
import {CaptureFlowSelectorModel} from "./captureFlowSelector.model";

export class CaptureFlowSelectorView extends TurboView<CaptureFlowSelector, CaptureFlowSelectorModel> {
    public timerText: HTMLElement;

    private selectorDiv: HTMLElement;
    private flowSelector: TurboSelectWheel;
    private pathSelector: TurboSelectWheel;

    protected setupUIElements() {
        this.timerText = p();
        this.selectorDiv = div();
        this.flowSelector = new TurboSelectWheel({direction: Direction.vertical});
        this.pathSelector = new TurboSelectWheel({direction: Direction.vertical});

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

    public refresh(): void {
        console.log("REFRESHINGGGGGGGGG");
        this.flowSelector.values = this.element.director.flows
            .filter(flow => flow.hasNode(this.element.card.dataId))
            .map(flow => new TurboSelectEntry({
                value: flow.color,
                secondaryValue: flow.dataId,
                onSelected: (b) => {
                    if (!b) return;
                    this.pathSelector.values = flow.paths
                        .filter(path => path.hasNode(this.element.card.id))
                        .map(path => new TurboSelectEntry({
                            value: path.name,
                            secondaryValue: path.id
                        }));
                }
            }));
        console.log(this.flowSelector.values);

        if (this.flowSelector.values.length > 0) this.flowSelector.select(this.flowSelector.values[0]);
    }
}