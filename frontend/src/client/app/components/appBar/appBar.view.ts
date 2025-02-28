import {DefaultEventName, h3, icon, spacer, TurboIcon, TurboView} from "turbodombuilder";
import {AppBar} from "./appBar";
import {leave_room} from "../../../sync/datastore";
import {show_projects} from "../../index";

export class AppBarView extends TurboView<AppBar> {
    private fullscreenToggle: TurboIcon;
    private canvasTitle: HTMLElement;
    private backButton: TurboIcon;

    protected setupUIElements() {
        super.setupUIElements();

        this.fullscreenToggle = icon({icon: "maximize"})
        this.canvasTitle = h3({text: "TODO"});
        this.backButton = icon({icon: "home"});
    }

    protected setupUILayout() {
        super.setupUILayout();
        this.element.addChild([this.backButton, spacer(), this.canvasTitle, spacer(), this.fullscreenToggle]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();

        this.fullscreenToggle.addListener(DefaultEventName.click, () => this.toggleFullscreen());
        this.backButton.addListener(DefaultEventName.click, () => {
            leave_room();
            show_projects();
        });
    }

    private toggleFullscreen() {
        //Enter fullscreen mode
        if (!document.fullscreenElement) {
            this.fullscreenToggle.icon = "minimize";
            if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
            else if ("mozRequestFullScreen" in document.documentElement
                && typeof document.documentElement.mozRequestFullScreen == "function")
                document.documentElement.mozRequestFullScreen();
            else if ("webkitRequestFullscreen" in document.documentElement
                && typeof document.documentElement.webkitRequestFullscreen == "function")
                document.documentElement.webkitRequestFullscreen();
            else if ("msRequestFullscreen" in document.documentElement
                && typeof document.documentElement.msRequestFullscreen == "function")
                document.documentElement.msRequestFullscreen();
        }
        //Exit fullscreen mode
        else {
            this.fullscreenToggle.icon = "maximize";
            if (document.exitFullscreen) document.exitFullscreen();
            else if ("mozCancelFullScreen" in document.documentElement
                && typeof document.documentElement.mozCancelFullScreen == "function")
                document.documentElement.mozCancelFullScreen();
            else if ("webkitExitFullscreen" in document.documentElement
                && typeof document.documentElement.webkitExitFullscreen == "function")
                document.documentElement.webkitExitFullscreen();
            else if ("msExitFullscreen" in document.documentElement
                && typeof document.documentElement.msExitFullscreen == "function")
                document.documentElement.msExitFullscreen();
        }
    }
}