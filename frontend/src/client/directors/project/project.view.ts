import {DataBlockObserver, div, turbo} from "turbodombuilder";
import {Project} from "./project";
import {ProjectModel} from "./project.model";
import {ProjectScreens} from "./project.types";
import {RootDirectorView} from "../rootDirector/rootDirector.view";
import {toolPanel, ToolPanel} from "../../panels/toolPanel/toolPanel";
import {vcCanvas} from "../../screens/canvas/canvas";
import {SyncedBranchingNode} from "../../components/branchingNode/branchingNode.types";
import {branchingNode, BranchingNode} from "../../components/branchingNode/branchingNode";
import {SyncedFlow} from "../../components/flow/flow.types";
import {Flow} from "../../components/flow/flow";
import {card, Card} from "../../components/card/card";
import {SyncedCard} from "../../components/card/card.types";
import {camera} from "../../screens/camera/camera";

export class ProjectView extends RootDirectorView<Project, ProjectModel> {
    //Parents used to segregate different types of elements placed on the canvas
    //Mainly to make sure that flows are below cards
    public cardsParent: HTMLElement;
    public flowsParent: HTMLElement;

    public toolPanel: ToolPanel;

    public cardsObserver: DataBlockObserver<SyncedCard, Card>;
    public branchingNodesObserver: DataBlockObserver<SyncedBranchingNode, BranchingNode>;
    public flowsObserver: DataBlockObserver<SyncedFlow, Flow>;

    public initialize() {
        super.initialize();
        turbo(this).childHandler = this.content;
    }

    protected setupUIElements() {
        super.setupUIElements();
        this.element.screensParent = this.content;

        this.cardsParent = div();
        this.flowsParent = div();

        this.toolPanel = toolPanel({director: this.element});

        this.element.addScreen(vcCanvas({director: this.element}), ProjectScreens.canvas);
        this.element.addScreen(camera({director: this.element}), ProjectScreens.camera);
    }

    protected setupUILayout() {
        super.setupUILayout();
        turbo(this).addChild(this.toolPanel);
        turbo(this.element.canvas.content).addChild([this.flowsParent, this.cardsParent]);
    }

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        this.cardsObserver = this.model.cardsBlock.generateObserver({
            onAdded: () => card({parent: this.cardsParent, director: this.element})
        });
        this.branchingNodesObserver = this.model.branchingNodesBlock.generateObserver({
            onAdded: () => branchingNode({parent: this.cardsParent, director: this.element})
        });
        this.flowsObserver = this.model.flowsBlock.generateObserver({
            onAdded: () => new Flow({parent: this.flowsParent, director: this.element})
        });
    }
}