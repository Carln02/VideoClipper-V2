import "./styles/main.css";
import {RootDirector} from "./directors/rootDirector/rootDirector";
import {Project} from "./directors/project/project";
import {ProjectScreens} from "./directors/project/project.types";

RootDirector.initialize();
const project = new Project({parent: document.body});

console.log("HIIII");

const segments = window.location.pathname.split("/").filter(Boolean);
const projectId = segments[segments.length - 1];
if (!Number.parseInt(projectId)) throw new Error("Invalid project ID in URL.");

project.groupsHandler.openProject(projectId as any).then(({doc, websocket}) => {
    websocket.onConnect.add(() => {
        project.document = doc;
        project.currentType = ProjectScreens.canvas;
    });
});