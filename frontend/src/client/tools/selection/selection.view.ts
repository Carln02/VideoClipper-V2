import {div, TurboView} from "turbodombuilder";
import {Selection} from "./selection";
import {SelectionModel} from "./selection.model";
import {MovableComponent} from "../../components/basicComponents/movableComponent/movableComponent";
import {Clip} from "../../components/clip/clip";

export class SelectionView extends TurboView<Selection, SelectionModel> {
    public clipClone: MovableComponent<Clip> = null;
    public timelineIndicator: HTMLDivElement;

    protected setupUIElements() {
        super.setupUIElements();
        this.timelineIndicator = div({style: "background-color: pink; width: 5px; border: 2px solid cyan"});

    }
}