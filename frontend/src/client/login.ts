import {RootDirector} from "./directors/rootDirector/rootDirector";
import {AuthenticationHandler} from "./handlers/authenticationHandler/authenticationHandler";
import {TurboEventManager} from "turbodombuilder";

RootDirector.initialize();
const auth = new AuthenticationHandler();
auth.init().then(() => {
    auth.renderGoogleButton(document.body);
    TurboEventManager.instance.preventDefaultMouse = false;
    TurboEventManager.instance.preventDefaultTouch = false;
    TurboEventManager.instance.preventDefaultWheel = false;
    TurboEventManager.instance.clickEventEnabled = true;
    auth.onLogin.add(() => window.location.href = "/");
});