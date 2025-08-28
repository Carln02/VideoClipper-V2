import "./styles/main.css";
import {RootDirector} from "./directors/rootDirector/rootDirector";
import {Project} from "./directors/project/project";
import {ProjectScreens, ToolType} from "./directors/project/project.types";
import {Card} from "./components/card/card";
import {clearUrlParams, getUrlParam, pushUrlParams} from "./utils/url";

RootDirector.initialize();
const project = new Project({parent: document.body});

const segments = window.location.pathname.split("/").filter(Boolean);
const projectId = segments[segments.length - 1];
if (!Number.parseInt(projectId)) throw new Error("Invalid project ID in URL.");

project.groupsHandler.openProject(projectId as any).then(({doc, websocket}) => {
    websocket.onConnect.add(() => {
        project.document = doc;
        project.currentType = ProjectScreens.canvas;

        window.addEventListener("popstate", () => {
            if (project.currentType === ProjectScreens.camera) {
                project.currentType = ProjectScreens.canvas;
                clearUrlParams();
            }
        });

        const cardId = getUrlParam("card");
        const card = project.getNode(cardId);
        if (card && card instanceof Card) {
            project.currentType = ProjectScreens.camera;
            project.camera.card = card;
            project.toolPanel.changePanel(ToolType.shoot);
            project.camera.startStream();
            pushUrlParams();
        }
    });
});