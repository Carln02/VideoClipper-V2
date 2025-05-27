import {App} from "./app/app";
import dotenv from "dotenv";

dotenv.config();

(async () => {
    const appInstance = new App();
    await appInstance.initialize();
    appInstance.createServer();
})();

