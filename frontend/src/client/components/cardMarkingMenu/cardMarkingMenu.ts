import {
    canvas,
    DefaultEventName,
    define, div, h3, h4, p, TurboEvent,
    TurboMarkingMenu,
    TurboMarkingMenuProperties,
    TurboSelectEntry
} from "turbodombuilder";
import {Card} from "../card/card";
import {CardMenu} from "./cardMarkingMenu.types";
import QRCode from "qrcode";
import "./cardMarkingMenu.css";

@define()
export class CardMarkingMenu extends TurboMarkingMenu {
    public card: Card;

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
            value: CardMenu.share, text: "Share",
            action: () => {
                this.url.searchParams.set("card", this.card.dataId);
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

        this.addEntry(new TurboSelectEntry({
            value: CardMenu.delete, text: "Delete",
            action: () => this.card.delete()
        }));
    }

    public attachCard(card: Card) {
        card.addListener(DefaultEventName.clickEnd, (e) => e.stopImmediatePropagation());
        card.addListener(DefaultEventName.longPress, (e: TurboEvent) => {
            e.stopImmediatePropagation();
            this.card = card;
            this.show(true, e.position);
        });
    }
}