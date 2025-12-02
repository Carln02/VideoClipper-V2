import {TurboTool} from "turbodombuilder";
import {Tool} from "../../components/tool/tool";
import {ProjectScreens, ToolType} from "../../directors/project/project.types";
import {Card} from "../../components/card/card";
import {Camera} from "../../screens/camera/camera";
import {Clip} from "../../components/clip/clip";

/**
 * @description Tool that allows the user to shoot video clips into a card
 */
export class ShootTool extends TurboTool<Tool> {
    public toolName = ToolType.shoot;

    protected get camera(): Camera {
        return this.element.director.camera;
    }

    public onActivate() {
        // this.camera?.startStream();
    }

    public onDeactivate() {
        this.camera?.stopStream();
    }

    public clickStart(_, target: Node): boolean {
        if (target instanceof Clip) {
            this.element.director.contextManager.setContext(target, 2);
        } else if (target instanceof Card) {
            this.element.director.contextManager.setContext(target, 1);
            return true;
        }
    }

    public click(_, target: Node): boolean {
        if (target instanceof Clip) {
            this.element.director.camera.snapToClip(target);
        } else if (target instanceof Card) {
            this.element.director.currentType = ProjectScreens.camera;
            this.camera.card = target;
            // this.element.director.toolPanel.changePanel(ToolType.shoot);
            this.camera.startStream();

            const url = new URL(window.location.href);
            url.searchParams.set("card", target.dataId);
            history.pushState(null, "", url.toString());
            return true;
        }
    }
}