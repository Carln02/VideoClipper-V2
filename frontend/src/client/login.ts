import {RootDirector} from "./directors/rootDirector/rootDirector";
import {AuthenticationHandler} from "./handlers/authenticationHandler/authenticationHandler";

RootDirector.initialize();
const auth = new AuthenticationHandler();
auth.init().then(() => {
    auth.renderGoogleButton(document.body);
    auth.onLogin.add(() => window.location.href = "/");
});