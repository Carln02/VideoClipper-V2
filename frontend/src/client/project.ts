import "./styles/main.css";
import {RootDirector} from "./directors/rootDirector/rootDirector";
import {project} from "./directors/project/project";
import {ProjectScreens, ToolType} from "./directors/project/project.types";
import {Card} from "./components/card/card";
import {clearUrlParams, getUrlParam, pushUrlParams} from "./utils/url";

RootDirector.initialize();
const projectScreen = project({parent: document.body});

const segments = window.location.pathname.split("/").filter(Boolean);
const projectId = segments[segments.length - 1];
if (!Number.parseInt(projectId)) throw new Error("Invalid project ID in URL.");

projectScreen.groupsHandler.openProject(projectId as any).then(({doc, websocket}) => {
    websocket.onConnect.add(() => {
        projectScreen.document = doc;
        projectScreen.currentType = ProjectScreens.canvas;

        window.addEventListener("popstate", () => {
            if (projectScreen.currentType === ProjectScreens.camera) {
                projectScreen.currentType = ProjectScreens.canvas;
                clearUrlParams();
            }
        });

        const cardId = getUrlParam("card");
        const card = projectScreen.getNode(cardId);
        if (card && card instanceof Card) {
            projectScreen.currentType = ProjectScreens.camera;
            projectScreen.camera.card = card;
            projectScreen.toolPanel.changePanel(ToolType.shoot);
            projectScreen.camera.startStream();
            pushUrlParams();
        }
    });
});