import {
    canvas,
    DefaultEventName,
    define, div, h3, p, TurboEvent,
    TurboMarkingMenu,
    TurboMarkingMenuProperties,
    TurboSelectEntry, TurboSelectWheel
} from "turbodombuilder";
import {Card} from "../card/card";
import QRCode from "qrcode";
import {FlowSelectorMenu} from "./flowSelectorMarkingMenu.types";
import {FlowSelector} from "../flowSelector/flowSelector";
import {FlowPath} from "../flowPath/flowPath";

@define()
export class FlowSelectorMarkingMenu extends TurboMarkingMenu {
    public card: Card;
    public selector: FlowSelector;
    //@ts-ignore
    public wheel: TurboSelectWheel<string, string, FlowPath>;

    protected url: URL;

    protected qrCode: HTMLCanvasElement;
    protected qrCodePopup: HTMLDivElement;
    protected urlText: HTMLElement;

    public constructor(properties: TurboMarkingMenuProperties = {}) {
        super(properties);
        this.addClass("turbo-marking-menu");

        this.url = new URL(location.href);

        if (!properties.semiMinor) this.hasClass("marking-menu-v") ? properties.semiMinor = 40 : properties.semiMinor = 60;
        if (!properties.semiMajor) properties.semiMajor = 40;

        this.onSelect = () => this.show(false);
        this.addListener(DefaultEventName.clickEnd, (e: Event) => e.stopImmediatePropagation());

        this.initializeUI();
        this.initializeEntries();
    }

    protected setupUIElements(): void {
        super.setupUIElements();

        this.qrCode = canvas({width: 200, height: 200});
        this.qrCodePopup = div({classes: "popup-card qr-code-popup"});
        this.urlText = p();
    }

    protected setupUILayout() {
        super.setupUILayout();

        this.qrCodePopup.addChild([h3({text: "Scan this QR code to shoot on your device."}), this.qrCode, this.urlText]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();
        this.qrCodePopup.addListener(DefaultEventName.click, (e) => e.stopImmediatePropagation());
    }

    protected initializeEntries(): void {
        const shareEntry = new TurboSelectEntry({
            value: FlowSelectorMenu.share, text: "Share",
            action: () => {
                this.url.searchParams.set("card", this.card.dataId);
                if (this.selector) this.url.searchParams.set("selector", this.selector.dataId);
                if (this.wheel && this.wheel.selectedEntry) this.url.searchParams.set("path", this.wheel.selectedEntry.dataId);
                QRCode.toCanvas(this.qrCode, this.url.toString(), (error) => console.error(error));
                this.urlText.textContent = this.url.toString();
            }
        });

        shareEntry.addListener(DefaultEventName.click, (e: TurboEvent) => {
            this.qrCodePopup.style.top = e.position.y + "px";
            this.qrCodePopup.style.left = e.position.x + "px";
            document.body.addChild(this.qrCodePopup);
            this.card.director.addListener(DefaultEventName.click, () => this.qrCodePopup.remove());
            this.show(false);
        });

        this.addEntry(shareEntry);
    }

    //@ts-ignore
    public attachSelector(selector: FlowSelector, selectorWheel: TurboSelectWheel<string, string, FlowPath>, card: Card) {
        selector.addListener(DefaultEventName.clickEnd, (e) => e.stopImmediatePropagation());
        selector.addListener(DefaultEventName.longPress, (e: TurboEvent) => {
            e.stopImmediatePropagation();
            this.card = card;
            this.selector = selector;
            this.wheel = selectorWheel;
            this.show(true, e.position);
        });
    }
}