import {GroupList} from "./views/grouplist/grouplist";
import {FileList} from "./views/filelist/filelist";
import {getDocument} from "./sync/datastore";

import "./main.css";
import "./styles/input.css";
import "./styles/markingMenu.css";
import "./styles/drawer.css";
import {App} from "./screens/app/app";
import {AppScreens} from "./screens/app/app.types";
import * as logman from "./sync/logman";


//  Initialize login manager

async function start() {
    await logman.init();
    await logman.wait_public_index();
    console.log("Logged in");
    show_groups();
}

//  Basic functions

let contents: Element;

App.initialize();
const app = new App({parent: document.body});
app.currentType = AppScreens.home;


export function show_groups() {
    contents?.remove();
    contents = new GroupList();
    app.preventDefaultEvents = false;
}

export function show_projects() {
    contents?.remove();
    contents = new FileList();
    app.preventDefaultEvents = false;
}

export function show_project() {
    contents?.remove();
    app.preventDefaultEvents = true;
    setTimeout(() => {
        app.documentManager.document = getDocument();
        app.currentType = AppScreens.document;
    }, 1000)
}

//  Populate page

start();
