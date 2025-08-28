import {
    DefaultEventName,
    Direction,
    div, icon,
    p,
    Shown,
    StatefulReifect, TurboIcon,
    TurboSelectEntry,
    TurboSelectWheel,
    TurboView
} from "turbodombuilder";
import {CaptureFlowSelector} from "./captureFlowSelector";
import {CaptureFlowSelectorModel} from "./captureFlowSelector.model";
import {Card} from "../card/card";
import {Flow} from "../flow/flow";
import {FlowPath} from "../flowPath/flowPath";
import {getUrlParam, replaceUrlParams} from "../../utils/url";

export class CaptureFlowSelectorView extends TurboView<CaptureFlowSelector, CaptureFlowSelectorModel> {
    public timerText: HTMLElement;

    private selectorDiv: HTMLElement;
    private flowSelector: TurboSelectWheel;
    private pathSelector: TurboSelectWheel;

    private previousCardIcon: TurboIcon;
    private nextCardIcon: TurboIcon;

    protected get currentFlow(): Flow {
        const selectedFlowId = this.flowSelector.selectedEntry?.secondaryValue;
        if (!selectedFlowId) return undefined;
        return this.element.director.getFlow(selectedFlowId);
    }

    protected get currentPath(): FlowPath {
        const selectedPathId = this.pathSelector.selectedEntry?.secondaryValue;
        if (!selectedPathId) return undefined;
        return this.currentFlow.paths.find(path => path.dataId === selectedPathId);
    }

    protected get currentPathNodeIds(): string[] {
        return this.currentPath?.nodeIdsArray || [];
    }

    protected get currentNodeIndexInPath(): number {
        return this.currentPathNodeIds.indexOf(this.element.card.dataId);
    }

    protected get nextCard(): Card {
        const curIndex = this.currentNodeIndexInPath;
        const nodeIds = this.currentPathNodeIds;
        if (curIndex < 0 || curIndex >= nodeIds.length - 1) return undefined;
        return this.element.director.getNode(nodeIds[curIndex + 1]) as Card;
    }

    protected get previousCard(): Card {
        const curIndex = this.currentNodeIndexInPath;
        const nodeIds = this.currentPathNodeIds;
        if (curIndex < 1) return undefined;
        return this.element.director.getNode(nodeIds[curIndex - 1]) as Card;
    }

    protected setupUIElements() {
        this.timerText = p();
        this.selectorDiv = div();
        this.flowSelector = new TurboSelectWheel({direction: Direction.vertical});
        this.pathSelector = new TurboSelectWheel({direction: Direction.vertical});

        this.previousCardIcon = icon({icon: "chevron-left"});
        this.nextCardIcon = icon({icon: "chevron-right"});

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
        this.selectorDiv.addChild([this.previousCardIcon, this.flowSelector, p({text: "/"}), this.pathSelector, this.nextCardIcon]);
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

    protected setupUIListeners() {
        this.previousCardIcon.addListener(DefaultEventName.click, () => {
            const prevCard = this.previousCard;
            if (prevCard) this.element.camera.card = prevCard;
        });

        this.nextCardIcon.addListener(DefaultEventName.click, () => {
            const nextCard = this.nextCard;
            if (nextCard) this.element.camera.card = nextCard;
        });
    }

    private padNumber(num: number, length: number = 2): string {
        return num.toString().padStart(length, "0");
    }

    public refresh(): void {
        this.flowSelector.values = this.element.director.flows
            .filter(flow => flow.hasNode(this.element.card.dataId))
            .map(flow => new TurboSelectEntry({
                value: flow.color,
                secondaryValue: flow.dataId,
                onSelected: (b) => {
                    if (!b) return;
                    replaceUrlParams({name: "flow", value: flow.dataId});
                    this.pathSelector.values = [];
                    flow.selectors.forEach(selector => selector.paths
                        .filter(path => path.hasNode(this.element.card.dataId))
                        .forEach(path => this.pathSelector.addEntry(new TurboSelectEntry({
                                    value: path.name,
                                    secondaryValue: path.dataId,
                                    onSelected: (b) => {
                                        if (!b) return;
                                        replaceUrlParams({name: "selector", value: selector.dataId}, {
                                            name: "path",
                                            value: path.dataId
                                        });
                                        this.previousCardIcon.toggleClass("icon-disabled", !this.previousCard);
                                        this.nextCardIcon.toggleClass("icon-disabled", !this.nextCard);
                                    }
                                })
                            )
                        )
                    );
                    if (this.pathSelector.values.length > 0) {
                        const pathParam = getUrlParam("path");
                        try {
                            const pathEntry =
                                this.pathSelector.entries.find(entry => entry.secondaryValue === pathParam);
                            if (!pathEntry || !pathParam) throw new Error();
                            this.pathSelector.select(pathEntry);
                        } catch (e) {
                            this.pathSelector.selectByIndex(0);
                        }
                    }
                }
            }));

        if (this.flowSelector.values.length > 0) {
            const flowParam = getUrlParam("flow");
            try {
                const flowEntry =
                    this.flowSelector.entries.find(entry => entry.secondaryValue === flowParam);
                if (!flowEntry || !flowParam) throw new Error();
                this.flowSelector.select(flowEntry);
            } catch (e) {
                this.flowSelector.selectByIndex(0);
            }
        } else {
            this.previousCardIcon.toggleClass("icon-disabled", true);
            this.nextCardIcon.toggleClass("icon-disabled", true);
        }
    }
}