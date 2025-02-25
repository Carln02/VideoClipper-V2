import {DefaultEventName, define, div, TurboElement, TurboIconToggle} from "turbodombuilder";
import "./shootingSidePanel.css";
import {CaptureModeSlider} from "./components/captureModeSlider/captureModeSlider";
import {CaptureTimer} from "./components/captureTimer/captureTimer";
import {CaptureButton} from "./components/captureButton/captureButton";
import {BackgroundSelector} from "./components/backgroundSelector/backgroundSelector";
import {SidePanel} from "../../sidePanel";
import {Camera} from "../../../../views/camera/camera";
import {CaptureManager} from "../../../../views/camera/manager/captureManager/captureManager";
import {CaptureMode} from "../../../../views/camera/manager/captureManager/captureManager.types";
import {
    AnimatedContentSwitchingDiv
} from "../../../animationComponents/animatedContentSwitchingDiv/animatedContentSwitchingDiv";
import {ClipRendererVisibility} from "../../../clipRenderer/clipRenderer.types";
import {SidePanelInstance} from "../../sidePanel.types";

@define("shooting-side-panel")
export class ShootingSidePanel extends TurboElement implements SidePanelInstance {
    private readonly camera: Camera;
    private readonly captureManager: CaptureManager;

    private captureButton: CaptureButton;
    private readonly modeSlider: CaptureModeSlider;
    private readonly captureTimer: CaptureTimer;

    private ghost: TurboIconToggle;
    private switchCamera: TurboIconToggle;
    private microphone: TurboIconToggle;

    private readonly backgroundSelector: BackgroundSelector;

    private readonly animatedDiv: AnimatedContentSwitchingDiv;

    private _mode: CaptureMode;

    constructor(camera: Camera, captureManager: CaptureManager, sidePanel: SidePanel) {
        super();
        this.camera = camera;
        this.captureManager = captureManager;

        this.modeSlider = new CaptureModeSlider(this, [CaptureMode.photo, CaptureMode.video, CaptureMode.create]);
        this.addChild(this.modeSlider);
        requestAnimationFrame(() => this.modeSlider.index = 1);

        this.captureTimer = new CaptureTimer({parent: this.camera});
        this.initButtons();

        this.backgroundSelector = new BackgroundSelector(this, {style: `margin-top: ${sidePanel.panelMarginTop}px`});

        const topDiv = div({
            classes: "camera-buttons-div",
            children: this.ghost
        });

        const bottomDiv = div({
            classes: "camera-buttons-div",
            children: [this.switchCamera, this.microphone]
        });

        this.animatedDiv = new AnimatedContentSwitchingDiv({
            children: [
                div({
                    children: [topDiv, this.captureButton, bottomDiv]
                }),
                this.backgroundSelector
            ]
        });
        this.addChild(this.animatedDiv);
    }

    public attach() {}
    public detach() {}

    private initButtons() {
        this.captureButton = new CaptureButton({
            listeners: {
                [DefaultEventName.click]: (e: Event) => {
                    e.stopImmediatePropagation();
                    if (this.mode == CaptureMode.photo) this.captureManager.snapPicture();
                    else if (this.mode == CaptureMode.video) this.mode = CaptureMode.videoShooting;
                    else if (this.mode == CaptureMode.videoShooting) this.mode = CaptureMode.video;
                }
            }
        });

        // this.ghost = iconToggle({
        //     icon: "ghost-on",
        //     toggled: true,
        //     onToggle: (value, el) => {
        //         el.icon = "ghost-" + (value ? "on" : "off");
        //         this.camera.ghosting = value;
        //     },
        //     listeners: {[DefaultEventName.click]: () => this.ghost.toggle()}
        // });
        //
        // this.switchCamera = iconToggle({
        //     icon: "switch-camera",
        //     onToggle: () => this.captureManager.switchCamera(),
        //     listeners: {[DefaultEventName.click]: () => this.switchCamera.toggle()}
        // });
        //
        // this.microphone = iconToggle({
        //     icon: "microphone-on",
        //     toggled: true,
        //     onToggle: (value, el) => {
        //         el.icon = "microphone-" + (value ? "on" : "off");
        //         this.captureManager.muteAudio(!value);
        //     },
        //     listeners: {"vc-click": () => this.microphone.toggle()}
        // });
    }

    public get mode(): CaptureMode {
        return this._mode;
    }

    public set mode(value: string) {
        if (this.mode == value) return;
        if (this.mode == CaptureMode.videoShooting) this.stopShooting();
        this._mode = value as CaptureMode;
        this.updateCamera();
        this.updateUI();
        if (value == CaptureMode.videoShooting) this.startShooting();
    }

    public updateCamera() {
        if (this.mode == CaptureMode.create) {
            this.camera.visible = true;
            this.camera.fillCanvas(this.backgroundSelector.selectedValue);
        } else if (this.mode == CaptureMode.videoShooting) {
            this.camera.visibilityMode = ClipRendererVisibility.hidden;
        } else {
            this.camera.visible = false;
        }
    }

    private updateUI() {
        this.modeSlider.show(this.mode != CaptureMode.videoShooting);
        this.captureButton.updateState(this.mode);
        // this.backgroundSelector.show(this.mode == CaptureMode.create);

        this.ghost.show(this.mode != CaptureMode.create);
        this.switchCamera.show(this.mode != CaptureMode.create);
        this.microphone.show(this.mode == CaptureMode.video || this.mode == CaptureMode.videoShooting);
        this.animatedDiv.switchTo(this.animatedDiv.children[this.mode == CaptureMode.create ? 1 : 0] as HTMLElement);

    }

    private stopShooting() {
        this.captureTimer.stop();
        this.captureManager.stopRecording();
    }

    private startShooting() {
        this.captureTimer.start();
        this.captureManager.startRecording();
    }
}
