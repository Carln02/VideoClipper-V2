import {ToolPanelContentView} from "../toolPanelContent/toolPanelContent.view";
import {ShootingPanel} from "./shootingPanel";
import {ShootingPanelModel} from "./shootingPanel.model";
import {CaptureButton} from "../../components/captureButton/captureButton";
import {CaptureModeSlider} from "../../components/captureModeSlider/captureModeSlider";
import {CaptureTimer} from "../../components/captureTimer/captureTimer";
import {DefaultEventName, div, TurboIconToggle} from "turbodombuilder";
import {BackgroundSelector} from "../../components/backgroundSelector/backgroundSelector";
import {
    AnimatedContentSwitchingDiv
} from "../../components/animationComponents/animatedContentSwitchingDiv/animatedContentSwitchingDiv";
import {CaptureMode} from "../../managers/captureManager/captureManager.types";
import {ClipRendererVisibility} from "../../components/clipRenderer/clipRenderer.types";

export class ShootingPanelView extends ToolPanelContentView<ShootingPanel, ShootingPanelModel> {
    private captureButton: CaptureButton;
    private modeSlider: CaptureModeSlider;
    captureTimer: CaptureTimer;

    private ghost: TurboIconToggle;
    private switchCamera: TurboIconToggle;
    private microphone: TurboIconToggle;

    private backgroundSelector: BackgroundSelector;

    private animatedDiv: AnimatedContentSwitchingDiv;

    protected setupUIElements() {
        super.setupUIElements();

        this.modeSlider = new CaptureModeSlider(this.element, [CaptureMode.photo, CaptureMode.video, CaptureMode.create]);

        requestAnimationFrame(() => this.modeSlider.index = 1);

        this.captureTimer = new CaptureTimer();
        this.captureButton = new CaptureButton();

        this.ghost = new TurboIconToggle({
            icon: "ghost-on", toggled: true,
            onToggle: (value, el) => {
                el.icon = "ghost-" + (value ? "on" : "off");
                this.element.camera.visibilityMode = value ? ClipRendererVisibility.ghosting : ClipRendererVisibility.hidden;
            }
        });

        this.switchCamera = new TurboIconToggle({
            icon: "switch-camera",
            onToggle: () => this.element.camera.switchCamera()
        });

        this.microphone = new TurboIconToggle({
            icon: "microphone-on", toggled: true,
            onToggle: (value, el) => {
                el.icon = "microphone-" + (value ? "on" : "off");
                this.element.camera.muteAudio(!value);
            },
        });

        // this.backgroundSelector = new BackgroundSelector(this, {style: `margin-top: ${sidePanel.panelMarginTop}px`});
        this.animatedDiv = new AnimatedContentSwitchingDiv();
    }

    protected setupUILayout() {
        super.setupUILayout();

        this.element.addChild([this.modeSlider, this.animatedDiv]);
        this.element.camera.addChild(this.captureTimer);

        this.animatedDiv.addChild([
            div({
                children: [
                    div({
                        classes: "camera-buttons-div",
                        children: this.ghost
                    }),
                    this.captureButton,
                    div({
                        classes: "camera-buttons-div",
                        children: [this.switchCamera, this.microphone]
                    })
                ]
            }),
            // this.backgroundSelector
        ]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();

        this.captureButton.addListener(DefaultEventName.click, (e: Event) => {
            e.stopImmediatePropagation();
            if (this.element.mode == CaptureMode.photo) this.element.camera.snapPicture();
            else if (this.element.mode == CaptureMode.video) this.element.mode = CaptureMode.videoShooting;
            else if (this.element.mode == CaptureMode.videoShooting) this.element.mode = CaptureMode.video;
        });

        this.ghost.addListener(DefaultEventName.click, () => this.ghost.toggle());
        this.switchCamera.addListener(DefaultEventName.click, () => this.switchCamera.toggle());
        this.microphone.addListener(DefaultEventName.click, () => this.microphone.toggle());
    }


    public refresh(mode: CaptureMode = this.element.mode) {
        this.modeSlider.show(mode != CaptureMode.videoShooting);
        this.captureButton.updateState(mode);
        // this.backgroundSelector.show(this.mode == CaptureMode.create);

        this.ghost.show(mode != CaptureMode.create);
        this.switchCamera.show(mode != CaptureMode.create);
        this.microphone.show(mode == CaptureMode.video || mode == CaptureMode.videoShooting);
        this.animatedDiv.switchTo(this.animatedDiv.children[mode == CaptureMode.create ? 1 : 0] as HTMLElement);

    }
}