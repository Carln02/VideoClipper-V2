import "./styles/main.css";
import {AppScreens} from "./directors/app/app.types";
import {RootDirector} from "./directors/rootDirector/rootDirector";
import {app} from "./directors/app/app";

RootDirector.initialize();
const appInst = app({parent: document.body});
appInst.preventDefaultEvents = false;
appInst.currentType = AppScreens.home;