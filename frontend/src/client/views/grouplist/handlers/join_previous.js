import {Popup} from "../../../components/popup/popup";
import * as logman from "../../../sync/logman";
import * as index from "../../../index";

let popup = null;

export async function join_previous(name, minicode, uid) {
    popup?.remove();
    popup = new Popup("Loading...");

    let id = await logman.get_room_id(name, minicode);
    let res = await logman.join_room(id, null);

    if(res.success) {
        finalize_go();
        return;
    }

    if(res.reason == "crypto_error_pwd" || res.reason == "crypto_error_secret") {
        request_password_new(name, minicode, uid);
    } else {
        prompt_reset(res.reason, uid);
    }
}

function request_password_new(name, minicode, uid) {
    popup?.remove();
    popup = new Popup({
        name: { tag: "p", classes: "padding-small bold", text: `Group "${name}" has changed password.` },
        info: { tag: "p", classes: "padding-small", text: "Please enter this group's password to join." },
        input: {
            tag: "input", type: "password", classes: "card", placeholder: `Eg. "1234"`,
            callback: e => process_password(name, minicode, popup.contents.input.value, uid)
        }
    })
}

async function process_password(name, minicode, password, uid) {
    popup.contents.buttons.confirm.innerText = "Loading...";

    let id = await logman.get_room_id(name, minicode);
    let res = await logman.join_room(id, null, password);

    if(res.success) {
        finalize_go();
        return;
    }

    if(res.reason == "crypto_error_pwd") {
        popup?.remove();
        popup = new Popup("Invalid password !");
    } else {
        prompt_reset(res.reason, uid);
    }
}

function prompt_reset(reason, uid) {
    popup?.remove();
    popup = new Popup({
        info: { tag: "p", classes: "padding-small", text: "Sorry, something went wrong: " + reason },
        buttons: {
            tag: "div", classes: "row gap",

            cancel: {
                tag: "button", classes: "clickable grow", text: "Cancel",
                listeners: { click: e => popup.remove() }
            },
            confirm: {
                tag: "button", classes: "clickable grow", text: "Reset",
                listeners: { click: e => reset_group(uid) }
            }
        }
    })
}

function reset_group(uid) {
    let group_info = JSON.parse(localStorage.getItem("logged_groups"));
    delete group_info[uid];
    localStorage.setItem("logged_groups", JSON.stringify(group_info));
    window.location.reload();
}

function finalize_go() {
    popup?.remove();
    index.show_projects();
}


