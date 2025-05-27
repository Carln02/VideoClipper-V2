import {Popup} from "../../../components/popup/popup";
import * as logman from "../../../sync/logman";
import * as index from "../../../index";

let popup = null;

export function create_new() {
    popup?.remove();
    popup = new Popup({
        name: { tag: "p", classes: "padding-small bold", text: `Please select a name and options for your new group.` },
        input: {
            tag: "input", type: "text", classes: "card", placeholder: `Name (eg. "My Group")`,
            callback: e => process_new(popup.contents.public.checkbox.checked, popup.contents.password.checkbox.checked, popup.contents.input.value)
        },
        public: {
            tag: "div", classes: "padding-small row gap",

            checkbox: { tag: "input", type: "checkbox", id: "group.new.public", checked: "true" },
            label: { tag: "label", text: "Publicly visible" }
        },
        password: {
            tag: "div", classes: "padding-small row gap",

            checkbox: { tag: "input", type: "checkbox", id: "group.new.password", checked: "true" },
            label: { tag: "label", text: "Password protected" }
        }
    });

    popup.contents.public.label.setAttribute("for", "group.new.public");
    popup.contents.password.label.setAttribute("for", "group.new.password");
}

function process_new(isPublic, hasPassword, name) {
    if(!hasPassword) finalize(isPublic, null, name);

    popup?.remove();
    popup = new Popup({
        name: { tag: "p", classes: "padding-small bold", text: `Please create a password for your new group.` },
        input: {
            tag: "input", type: "password", classes: "card", placeholder: `Eg. "1234"`,
            callback: e => verify_password(isPublic, popup.contents.input.value, name)
        }
    })
}

function verify_password(isPublic, password, name) {
    popup?.remove();
    popup = new Popup({
        name: { tag: "p", classes: "padding-small bold", text: `Please verify the password you just created.` },
        info: { tag: "p", classes: "padding-small", text: `Type the password again to verify.` },
        input: {
            tag: "input", type: "password", classes: "card", placeholder: `Eg. "1234"`,
            callback: e => process_verify_password(isPublic, password, popup.contents.input.value, name)
        }
    })
}

function process_verify_password(isPublic, password1, password2, name) {
    if(password1 == password2) {
        finalize(isPublic, password1, name);
        return;
    }

    popup?.remove();
    popup = new Popup("Passwords do not match");
}

async function finalize(isPublic, password, name) {
    popup.contents.buttons.confirm.innerText = "Loading...";

    try {
         let code = await logman.make_room(name, isPublic, password);

         popup?.remove();
         popup = new Popup({
             name: { tag: "p", classes: "padding-small bold", text: "Here is your Quick Access code" },
             info: { tag: "p", classes: "padding-small", text: "Make sure you remember it well, your peers will need it to join your group" },
             code: { tag: "p", classes: "padding-small xxl", text: code },
             ok: {
                 tag: "button", classes: "clickable", text: "Ok",
                 listeners: { click: e => finalize_go() }
             }
         });
    } catch(e) {
        popup?.remove();
        popup = new Popup("Sorry, something went wrong !");
    }
}

function finalize_go() {
    popup?.remove();
    index.show_projects();
}


