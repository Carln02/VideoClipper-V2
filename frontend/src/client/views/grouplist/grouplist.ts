import {define, TurboElement, element} from "turbodombuilder";
import supermake from "../../utils/supermake";
import "./grouplist.css";
import * as logman from "../../sync/logman";
import * as jn from "./handlers/join_new";
import * as jp from "./handlers/join_previous";
import * as cn from "./handlers/create_new";

@define("vc-grouplist")
export class GroupList extends TurboElement {
    main = null;
    sheet = null;

    constructor() {
        super({ parent: document.body });

        this.addClass("column");
        let public_group_list = logman.list_public_rooms();
        let group_info = JSON.parse(localStorage.getItem("logged_groups"));

        //  Main content list

        this.main = supermake({
            tag: "div", classes: "scroller grow",

            groups: {
                tag: "div", classes: "content-wrapper column gap-large",

                search: { tag: "input", type: "text", classes: "card", placeholder: "Search groups..." },
                mine: {
                    tag: "div", classes: "column gap",

                    title_: { tag: "p", classes: "padding bold large", text: "My groups" },
                    list: { tag: "div", classes: "column" }
                },
                public: {
                    tag: "div", classes: "column gap",

                    title_: { tag: "p", classes: "padding bold large", text: "Public groups" },
                    list: { tag: "div", classes: "column" }
                },
                private: {
                    tag: "div", classes: "column gap hidden",

                    title_: { tag: "p", classes: "padding bold large", text: "Private groups" },
                    button: { tag: "button", classes: "clickable left", text: "empty" }
                }
            }
        }, this);

        //  Bottom sheet

        this.sheet = supermake({
            tag: "div", classes: "bottom-sheet",

            info: {
                tag: "div", classes: "content-wrapper row gap",

                join: {
                    tag: "button", classes: "bold clickable", text: "Join hidden group",
                    listeners: { click: e => jn.join_private() }
                },
                info: { tag: "p", classes: "padding bold grow", text: `${[...public_group_list.keys()].length} groups` },
                create: {
                    tag: "button", classes: "bold clickable", text: "Create group",
                    listeners: { click: e => cn.create_new() }
                }
            }
        }, this);



        for(let group_id in group_info) {
            let gi = group_info[group_id];

            let item = element({
                tag: "button", classes: "left clickable", parent: this.main.groups.mine.list,
                listeners: { click: () => jp.join_previous(gi.name, gi.minicode, group_id) }
            });

            item.innerHTML = `${gi.name} <span class="bold translucent">#${gi.minicode}</span>`
        }

        for(let group_id of [...public_group_list.keys()]) {
            let name = (public_group_list.get(group_id) as any).name;

            element({
                tag: "button", classes: "left clickable", text: name, parent: this.main.groups.public.list,
                listeners: { click: e => jn.join_public(name) }
            })
        }
    }
}


