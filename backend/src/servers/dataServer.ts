import express, {Express} from "express";
import {MediaController} from "../media/media.controller";
import {MulterConfig} from "../config/config.multer";

export class DataServer {
    private app: Express;
    private readonly port: number;
    private readonly storagePath: string;
    private readonly multerConfig: MulterConfig;

    public constructor(port: number, mediaStoragePath: string) {
        this.port = port;
        this.storagePath = mediaStoragePath;
        this.app = express();
        this.multerConfig = new MulterConfig(this.storagePath);
    }

    public async init(): Promise<void> {
        this.app.use(express.json({limit: "100mb"}));

        //Logging
        this.app.use((req, _res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
            next();
        });

        //Error
        this.app.use((err: Error, _req: any, res: any, _next: any) => {
            console.error(`Error: ${err.message}`);
            return res.status(500).json({error: err.message});
        });

        this.registerControllers();
    }

    private registerControllers() {
        const mediaController = new MediaController(this.storagePath, this.multerConfig);

        // Register their routes
        this.app.use("/", mediaController.router);
        // e.g. you might do `.use('/media', mediaController.router)`
        // if you want all routes under /media prefix
    }

    public start(): void {
        this.app.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
            console.log(`Media storage path: ${this.storagePath}`);
        });
    }
}
