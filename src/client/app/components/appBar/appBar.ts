//@ts-nocheck
import {DefaultEventName, define, h3, icon, spacer, TurboElement, TurboIcon, TurboProperties} from "turbodombuilder";
import {leave_room} from "../../../sync/datastore";
import {show_projects} from "../../index";
import "./appBar.css";

@define("vc-app-bar")
export class AppBar extends TurboElement {
    private readonly fullscreenToggle: TurboIcon;
    private readonly canvasTitle: HTMLElement;
    private readonly backButton: TurboIcon;

    constructor(properties: TurboProperties = {}) {
        super(properties);

        this.fullscreenToggle = icon({
            icon: "maximize",
            listeners: {[DefaultEventName.click]: () => this.toggleFullscreen()}
        });

        this.canvasTitle = h3({text: "TODO"});

        this.backButton = icon({
            icon: "home",
            listeners: {
                [DefaultEventName.click]: () => {
                    leave_room();
                    show_projects();
                }
            }
        });

        this.addChild([this.backButton, spacer(), this.canvasTitle, spacer(), this.fullscreenToggle]);
    }

    private toggleFullscreen() {
        //Enter fullscreen mode
        if (!document.fullscreenElement) {
            this.fullscreenToggle.icon = "minimize";
            if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
            else if (document.documentElement.mozRequestFullScreen) document.documentElement.mozRequestFullScreen();
            else if (document.documentElement.webkitRequestFullscreen) document.documentElement.webkitRequestFullscreen();
            else if (document.documentElement.msRequestFullscreen) document.documentElement.msRequestFullscreen();
        }
        //Exit fullscreen mode
        else {
            this.fullscreenToggle.icon = "maximize";
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
        }
    }
}