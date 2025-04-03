import * as logman from "../sync/logman";
import {GroupList} from "./views/grouplist/grouplist";
import {FileList} from "./views/filelist/filelist";
import {getDocument} from "../sync/datastore";

import "./main.css";
import "./styles/input.css";
import "./styles/markingMenu.css";
import "./styles/drawer.css";
import {AppManager} from "./managers/appManager/appManager";
import {AppScreens} from "./managers/appManager/appManager.types";


//  Initialize login manager

async function start() {
    await logman.init();
    await logman.wait_public_index();
    console.log("Logged in");
    show_groups();
}

//  Basic functions

let contents: Element;

AppManager.initialize();
const app = new AppManager({parent: document.body});

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
