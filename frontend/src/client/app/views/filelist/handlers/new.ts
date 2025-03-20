import {Popup} from "../../../components/popup/popup";
import * as logman from "../../../../sync/logman";
import * as index from "../../../index";
import {documentRoot} from "../../../../sync/datastore";

let popup = null;

export function mk_new() {
    popup?.remove();
    popup = new Popup({
        info: { tag: "p", classes: "padding-small", text: "What's the name of your new project ?" },
        input: {
            tag: "input", type: "text", classes: "card", placeholder: `Eg. "My Project"`,
            callback: e => create(popup.contents.input.value)
        }
    })
}

function create(name) {
    popup?.remove();
    let id = logman.get_group_metadata().get("next_room_id");

    logman.get_group_rooms().set(id, name);
    logman.get_group_metadata().set("next_room_id", id + 1);

    logman.connect_project(id);

    const document = documentRoot();
    document.cards = {};
    document.branchingNodes = {};
    document.flows = {};
    document.media = {};
    document.counters = {cards: 0, flows: 0};

    index.show_project();
}
