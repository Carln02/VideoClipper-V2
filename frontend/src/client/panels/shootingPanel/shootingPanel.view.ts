import {ShootingPanel} from "./shootingPanel";
import {ShootingPanelModel} from "./shootingPanel.model";
import {CaptureButton} from "../../components/captureButton/captureButton";
import {CaptureFlowSelector} from "../../components/captureFlowSelector/captureFlowSelector";
import {
    ClickMode,
    DefaultEventName,
    div,
    icon,
    iconToggle,
    input,
    spacer,
    turbo,
    TurboEventManager,
    TurboIcon,
    TurboIconToggle,
    TurboSelectWheel,
    TurboView
} from "turbodombuilder";
import {BackgroundSelector} from "../../components/backgroundSelector/backgroundSelector";
import {CaptureMode} from "./shootingPanel.types";
import {
    AnimatedContentSwitchingDiv
} from "../../components/animationComponents/animatedContentSwitchingDiv/animatedContentSwitchingDiv";
import {ClipRendererVisibility} from "../../components/clipRenderer/clipRenderer.types";
import {CaptureModeSlider} from "../../components/captureModeSlider/captureModeSlider";
import {ToolType} from "../../directors/project/project.types";

export class ShootingPanelView extends TurboView<ShootingPanel, ShootingPanelModel> {
    private captureButton: CaptureButton;
    // private modeSlider: TurboSelectWheel;
    public captureFlowSelector: CaptureFlowSelector;

    private ghost: TurboIconToggle;
    private switchCamera: TurboIconToggle;
    private microphone: TurboIconToggle;

    private addGallery: TurboIcon;
    private addGalleryInput: HTMLInputElement;

    private backgroundSelector: BackgroundSelector;

    // private shootingDiv: TurboSelectEntry;
    // private backgroundColorDiv: TurboSelectEntry;
    // private editTextDiv: TurboSelectEntry;

    private animatedDiv: AnimatedContentSwitchingDiv;

    public initialize() {
        super.initialize();
        this.ghost.toggled = true;
        this.microphone.toggled = true;
        // this.modeSlider.index = 1;
    }

    protected setupUIElements() {
        super.setupUIElements();

        // this.modeSlider = new CaptureModeSlider({
        //     classes: "capture-mode-slider",
        //     values: [CaptureMode.photo, CaptureMode.video, CaptureMode.create, CaptureMode.edit],
        // });

        this.captureFlowSelector = new CaptureFlowSelector({director: this.element.director});
        this.captureButton = new CaptureButton();

        this.ghost = iconToggle({icon: "ghost-on", toggleOnClick: true});
        this.switchCamera = iconToggle({icon: "switch-camera", toggleOnClick: true});
        this.microphone = iconToggle({icon: "microphone-on", toggleOnClick: true});

        this.addGallery = icon({icon: "gallery"});
        this.addGalleryInput = input({type: "file", hidden: true, accept: "image/*,video/mp4,.mp4"});

        this.backgroundSelector = new BackgroundSelector();

        // this.shootingDiv = new TurboSelectEntry({value: "shooting", reflectValueOn: div()});
        // this.backgroundColorDiv = new TurboSelectEntry({value: "backgroundColor", reflectValueOn: div()});
        // this.editTextDiv = new TurboSelectEntry({value: "editText", reflectValueOn: div()});
        //
        // this.animatedDiv = new AnimatedContentSwitchingDiv({values: [this.shootingDiv, this.backgroundColorDiv]});
    }

    protected setupUILayout() {
        turbo(this).addChild([this.modeSlider, this.animatedDiv]);
        turbo(this.element.camera).addChild(this.captureFlowSelector);

        this.shootingDiv.addClass("camera-buttons");
        this.shootingDiv.addChild([
            div({
                classes: "camera-buttons-child",
                children: this.ghost
            }),
            this.captureButton,
            div({
                classes: "camera-buttons-child",
                children: [this.switchCamera, this.microphone, spacer(), this.addGalleryInput, this.addGallery]
            })
        ]);

        this.backgroundColorDiv.addChild(this.backgroundSelector);
    }

    protected setupUIListeners() {
        super.setupUIListeners();

        turbo(this.captureButton).on(DefaultEventName.click, (e: Event) => {
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

        turbo(this.addGallery).on(DefaultEventName.click, () => this.addGalleryInput.click());
        turbo(this.addGalleryInput).on(DefaultEventName.change, () => {
            Array.from(this.addGalleryInput.files || []).forEach(file => this.element.camera.uploadMedia(file));
        });

        this.backgroundSelector.onSelect = () => this.element.camera.currentCanvasFill = this.backgroundSelector.selectedValue;

        this.modeSlider.onSelect = ((b, entry) => {
            if (b) this.model.mode = entry.value as CaptureMode;
        });
    }

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        this.emitter.add("stopShooting", () => {
            this.captureFlowSelector.stopTimer();
            this.element.camera.stopRecording();
        });

        this.emitter.add("modeChanged", () => this.refresh());
    }

    public refresh(mode: CaptureMode = this.model.mode) {
        this.captureFlowSelector.refresh();
        const isCreateOrEdit = mode === CaptureMode.create || mode === CaptureMode.text;

        if (isCreateOrEdit) this.element.camera.visible = true;
        // this.camera.currentCanvasFill = this.backgroundSelector.selectedValue;
        else if (mode == CaptureMode.videoShooting) {
            this.element.camera.visibilityMode = ClipRendererVisibility.hidden;
            this.captureFlowSelector.startTimer();
            this.element.camera.startRecording();
        }
        else this.element.camera.visible = false;

        TurboEventManager.instance.setTool(TurboEventManager.instance
            .getToolByName(mode === CaptureMode.edit ? ToolType.selection : ToolType.shoot), ClickMode.left);

        turbo(this.modeSlider).show(mode != CaptureMode.videoShooting);
        this.captureButton.updateState(mode);
        // this.backgroundSelector.show(this.mode == CaptureMode.create);

        turbo(this.ghost).show(!isCreateOrEdit);
        turbo(this.switchCamera).show(!isCreateOrEdit);
        turbo(this.microphone).show(mode == CaptureMode.video || mode == CaptureMode.videoShooting);
        this.animatedDiv.select(isCreateOrEdit ? this.backgroundColorDiv : this.shootingDiv);
    }
}