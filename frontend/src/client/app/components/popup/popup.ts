import {define, TurboElement} from "turbodombuilder";
import supermake from "../../../utils/supermake";
import "./popup.css";

@define("vc-popup")
export class Popup extends TurboElement {
    contents = null;

    constructor(contents) {
        super({ parent: document.body });

        //  Define default popup on string input

        if(typeof contents === "string") contents = {
            info: { tag: "p", classes: "padding-small", text: contents },
            ok: {
                tag: "button", classes: "clickable", text: "Ok",
                listeners: { click: e => this.remove() }
            }
        }

        //  Define default buttons and callback if requested

        if(contents?.input?.callback) {
            contents.buttons = {
                tag: "div", classes: "row gap",

                cancel: {
                    tag: "button", classes: "clickable grow", text: "Cancel",
                    listeners: { click: e => this.remove() }
                },
                confirm: {
                    tag: "button", classes: "clickable grow", text: "Submit",
                    listeners: { click: e => contents.input.callback(e) }
                }
            };

            contents.input.listeners = {
                keyup: e => { if(e.key == 'Enter') contents.input.callback(e) }
            }
        }

        //  Create popup

        this.contents = supermake({
            tag: "div", classes: "card column gap",
            listeners: { click: e => e.stopPropagation() },

            ...contents
        }, this);

        //  Setup events

        this.addListener("click", e => this.remove());

        if(this.contents.input) this.contents.input.focus();
        else if(this.contents.ok) this.contents.ok.focus();
    }
}


