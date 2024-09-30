import {Popup} from "../../../components/popup/popup";
import * as logman from "../../../../sync/logman";
import * as index from "../../../index";

let is_public = false;
let popup = null;

export function join_public(name) {
    is_public = true;
    request_code(name);
}

export function join_private(name) {
    is_public = false;

    if(name) {
        request_code(name);
        return;
    }

    popup?.remove();
    popup = new Popup({
        info: { tag: "p", classes: "padding-small bold", text: "Please enter the name of the group you'd like to join" },
        note: { tag: "p", classes: "padding-small", text: "Make sure you type the name exactly !" },
        input: {
            tag: "input", type: "text", classes: "card", placeholder: `Eg. "My Group"`,
            callback: e => request_code(popup.contents.input.value)
        }
    })
}

function request_code(name) {
    popup?.remove();
    popup = new Popup({
        name: { tag: "p", classes: "padding-small bold", text: `Joining group "${name}"` },
        info: { tag: "p", classes: "padding-small", text: "Please enter the Quick Access code to join this group" },
        input: {
            tag: "input", type: "number", min: 0, max: 999, step: 1, classes: "card", placeholder: `Eg. 000`,
            callback: e => process_code(name, popup.contents.input.value)
        }
    })
}

async function process_code(name, minicode) {
    popup.contents.buttons.confirm.innerText = "Loading...";

    let id = await logman.get_room_id(name, minicode);
    let res = await logman.join_room(id, minicode);

    if(res.success) {
        finalize_go();
        return;
    }

    switch(res.reason) {
        case "index_does_not_exist":
            popup?.remove();
            popup = new Popup(is_public ? "Invalid Quick Access code !" : "This group doesn't exist !");
            break;

        case "needs_password":
            request_password(name, minicode);
            break;

        default:
            popup?.remove();
            popup = new Popup("Sorry, something went wrong: " + res.reason);
            break;
    }
}

function request_password(name, minicode) {
    popup?.remove();
    popup = new Popup({
        name: { tag: "p", classes: "padding-small bold", text: `Group "${name}" requires a password to join.` },
        info: { tag: "p", classes: "padding-small", text: "Please enter this group's password to join." },
        input: {
            tag: "input", type: "password", classes: "card", placeholder: `Eg. "1234"`,
            callback: e => process_password(name, minicode, popup.contents.input.value)
        }
    })
}

async function process_password(name, minicode, password) {
    popup.contents.buttons.confirm.innerText = "Loading...";

    let id = await logman.get_room_id(name, minicode);
    let res = await logman.join_room(id, minicode, password);

    if(res.success) {
        finalize_go();
        return;
    }

    if(res.reason == "crypto_error_pwd") {
        popup?.remove();
        popup = new Popup("Invalid password !");
    } else {
        popup?.remove();
        popup = new Popup("Sorry, something went wrong: " + res.reason);
    }
}

function finalize_go() {
    popup?.remove();
    index.show_projects();
}


