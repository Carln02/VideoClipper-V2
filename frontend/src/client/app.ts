import "./styles/main.css";
import {App} from "./directors/app/app";
import {AppScreens} from "./directors/app/app.types";
import {RootDirector} from "./directors/rootDirector/rootDirector";

RootDirector.initialize();
const app = new App({parent: document.body});
app.currentType = AppScreens.home;