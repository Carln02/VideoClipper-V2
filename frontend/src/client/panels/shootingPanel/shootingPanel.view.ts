import {ToolPanelContentView} from "../toolPanelContent/toolPanelContent.view";
import {ShootingPanel} from "./shootingPanel";
import {ShootingPanelModel} from "./shootingPanel.model";
import {CaptureButton} from "../../components/captureButton/captureButton";
import {CaptureTimer} from "../../components/captureTimer/captureTimer";
import {DefaultEventName, div, spacer, TurboIconToggle, TurboSelectEntry, TurboSelectWheel} from "turbodombuilder";
import {BackgroundSelector} from "../../components/backgroundSelector/backgroundSelector";
import {CaptureMode} from "./shootingPanel.types";
import {
    AnimatedContentSwitchingDiv
} from "../../components/animationComponents/animatedContentSwitchingDiv/animatedContentSwitchingDiv";
import {ClipRendererVisibility} from "../../components/clipRenderer/clipRenderer.types";
import {CaptureModeSlider} from "../../components/captureModeSlider/captureModeSlider";
import {ProjectScreens} from "../../screens/project/project.types";

export class ShootingPanelView extends ToolPanelContentView<ShootingPanel, ShootingPanelModel> {
    private captureButton: CaptureButton;
    private modeSlider: TurboSelectWheel;
    public captureTimer: CaptureTimer;

    private ghost: TurboIconToggle;
    private switchCamera: TurboIconToggle;
    private microphone: TurboIconToggle;

    private backgroundSelector: BackgroundSelector;

    private shootingDiv: TurboSelectEntry;
    private backgroundColorDiv: TurboSelectEntry;
    private animatedDiv: AnimatedContentSwitchingDiv;

    public initialize() {
        super.initialize();
        this.ghost.toggled = true;
        this.microphone.toggled = true;
        this.modeSlider.index = 1;
    }

    protected setupUIElements() {
        super.setupUIElements();

        this.modeSlider = new CaptureModeSlider({
            classes: "capture-mode-slider",
            values: [CaptureMode.photo, CaptureMode.video, CaptureMode.create],
        });

        this.captureTimer = new CaptureTimer();
        this.captureButton = new CaptureButton();

        this.ghost = new TurboIconToggle({icon: "ghost-on", toggleOnClick: true});
        this.switchCamera = new TurboIconToggle({icon: "switch-camera", toggleOnClick: true});
        this.microphone = new TurboIconToggle({icon: "microphone-on", toggleOnClick: true});

        this.backgroundSelector = new BackgroundSelector();

        this.shootingDiv = new TurboSelectEntry({value: "shooting", reflectValueOn: div()});
        this.backgroundColorDiv = new TurboSelectEntry({value: "backgroundColor", reflectValueOn: div()});

        this.animatedDiv = new AnimatedContentSwitchingDiv({values: [this.shootingDiv, this.backgroundColorDiv]});
    }

    protected setupUILayout() {
        super.setupUILayout();

        this.element.addChild([this.modeSlider, this.animatedDiv]);
        this.element.camera.addChild(this.captureTimer);

        this.shootingDiv.addClass("camera-buttons");
        this.shootingDiv.addChild([
            div({
                classes: "camera-buttons-child",
                children: this.ghost
            }),
            this.captureButton,
            div({
                classes: "camera-buttons-child",
                children: [this.switchCamera, this.microphone, spacer()]
            })
        ]);

        this.backgroundColorDiv.addChild(this.backgroundSelector);
    }

    protected setupUIListeners() {
        super.setupUIListeners();

        this.captureButton.addListener(DefaultEventName.click, (e: Event) => {
            e.stopImmediatePropagation();
            if (this.model.mode == CaptureMode.photo) this.element.camera.snapPicture();
            else if (this.model.mode == CaptureMode.video) this.model.mode = CaptureMode.videoShooting;
            else if (this.model.mode == CaptureMode.videoShooting) this.model.mode = CaptureMode.video;
        });

        this.ghost.onToggle = (value, el) => {
            el.icon = "ghost-" + (value ? "on" : "off");
            this.element.camera.visibilityMode = value ? ClipRendererVisibility.ghosting : ClipRendererVisibility.hidden;
        };

        this.microphone.onToggle = (value, el) => {
            el.icon = "microphone-" + (value ? "on" : "off");
            this.element.camera.muteAudio(!value);
        };

        this.switchCamera.onToggle = () => this.element.camera.switchCamera();
        this.backgroundSelector.onSelect = () => this.element.camera.fillCanvas(this.backgroundSelector.selectedValue);

        this.modeSlider.onSelect = ((b, entry) => {
            if (b) this.model.mode = entry.value as CaptureMode;
        });

        this.backButton.addListener(DefaultEventName.click, () => this.element.screenManager.currentType = ProjectScreens.canvas);
    }

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        this.emitter.add("stopShooting", () => {
            this.captureTimer.stop();
            this.element.camera.stopRecording();
        });

        this.emitter.add("modeChanged", () => this.refresh());
    }

    public refresh(mode: CaptureMode = this.model.mode) {
        if (mode == CaptureMode.create) this.element.camera.visible = true;
        // this.camera.fillCanvas(this.backgroundSelector.selectedValue);
        else if (mode == CaptureMode.videoShooting) {
            this.element.camera.visibilityMode = ClipRendererVisibility.hidden;
            this.captureTimer.start();
            this.element.camera.startRecording();
        }
        else this.element.camera.visible = false;

        this.modeSlider.show(mode != CaptureMode.videoShooting);
        this.captureButton.updateState(mode);
        // this.backgroundSelector.show(this.mode == CaptureMode.create);

        this.ghost.show(mode != CaptureMode.create);
        this.switchCamera.show(mode != CaptureMode.create);
        this.microphone.show(mode == CaptureMode.video || mode == CaptureMode.videoShooting);
        this.animatedDiv.select(mode == CaptureMode.create ? this.backgroundColorDiv : this.shootingDiv);
    }
}