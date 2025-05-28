import "./main.css";
import "./styles/input.css";
import "./styles/markingMenu.css";
import "./styles/colors.css";
import "./styles/drawer.css";
import {App} from "./screens/app/app";
import {AppScreens} from "./screens/app/app.types";

App.initialize();
const app = new App({parent: document.body});
app.currentType = AppScreens.home;