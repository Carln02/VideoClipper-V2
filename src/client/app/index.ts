import {Canvas} from "./views/canvas/canvas";
import * as logman from "../sync/logman";
import {ToolManager} from "./managers/toolManager/toolManager";
import {CursorManager} from "./managers/cursorManager/cursorManager";
import {Point, TurboEventManager, turbofy, TurboIcon} from "turbodombuilder";
import {GroupList} from "./views/grouplist/grouplist";
import {FileList} from "./views/filelist/filelist";
import {ContextManager} from "./managers/contextManager/contextManager";
import {ContextView} from "./managers/contextManager/contextManager.types";

import "./main.css";
import "./styles/input.css";
import "./styles/markingMenu.css";
import {get_doc} from "../sync/datastore";

turbofy();

TurboIcon.config.defaultDirectory = "assets/icons";
TurboIcon.config.defaultClasses = "icon";

const eventManager = new TurboEventManager({
    authorizeEventScaling: () => ContextManager.instance.view == ContextView.canvas,
    scaleEventPosition: (position: Point) => Canvas.instance.navigationManager.computePositionRelativeToCanvas(position),
});

//  Initialize login manager

async function start() {
    await logman.init();
    await logman.wait_public_index();
    show_groups();
}

//  Basic functions

let contents: Element;

export function show_groups() {
    contents?.remove();
    contents = new GroupList();
    eventManager.defaultState.preventDefaultTouch = false;
    eventManager.defaultState.preventDefaultMouse = false;
}

export function show_projects() {
    contents?.remove();
    contents = new FileList();
    eventManager.defaultState.preventDefaultTouch = false;
    eventManager.defaultState.preventDefaultMouse = false;
}

export function show_project() {
    contents?.remove();
    eventManager.defaultState.preventDefaultTouch = true;
    eventManager.defaultState.preventDefaultMouse = true;
    new ContextManager();
    new ToolManager();
    new CursorManager();

    let doc = get_doc();

    setTimeout(() => { contents = new Canvas(doc) }, 100)
}

//  Populate page

start();

export {eventManager};
