import {define, TurboElement, element} from "turbodombuilder";
import supermake from "../../utils/supermake.js";
import "./filelist.css";
import * as logman from "../../sync/logman";
import * as index from "../../index";
import * as mk_new from "./handlers/new";

@define("vc-filelist")
export class FileList extends TurboElement {
    main = null;
    sheet = null;

    constructor() {
        super({ parent: document.body });

        this.addClass("column");
        let ginfo = logman.get_group_metadata();

        //  Main content list

        this.main = supermake({
            tag: "div", classes: "scroller grow",

            content: {
                tag: "div", classes: "content-wrapper column gap-large",

                search: { tag: "input", type: "text", classes: "card", placeholder: "Search projects..." },
                files: {
                    tag: "div", classes: "column gap",

                    title_: { tag: "p", classes: "padding bold large", text: "Projects" },
                    list: { tag: "div", classes: "column" }
                }
            }
        }, this);

        //  Bottom sheet

        this.sheet = supermake({
            tag: "div", classes: "bottom-sheet",

            group: {
                tag: "div", classes: "content-wrapper row gap",

                edit: {
                    tag: "button", classes: "clickable bold", text: "Edit info",
                    listeners: { click: e => window.alert("Not yet implemented !") }
                },
                name: { tag: "p", classes: "padding bold grow", text: "Loading..." },
                logout: {
                    tag: "button", classes: "clickable bold", text: "Back home",
                    listeners: { click: e => { logman.quit_room(); index.show_groups(); } }
                },
                make_new: {
                    tag: "button", classes: "clickable bold", text: "New project",
                    listeners: { click: e => mk_new.mk_new() }
                }
            }
        }, this);

        //  Set group name

        this.sheet.group.name.innerHTML = `${ginfo.get("name")} <span class="translucent">#${ginfo.get("minicode")}</span>`

        //  Populate projects

        let rooms = logman.get_group_rooms();

        for(let room_id of [...rooms.keys()]) {
            let name = rooms.get(room_id);

            element({
                tag: "button", classes: "left clickable", text: name, parent: this.main.content.files.list,
                listeners: { click: e => { logman.connect_project(room_id); index.show_project() } }
            })
        }
    }
}


