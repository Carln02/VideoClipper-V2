import multer, {StorageEngine} from "multer";
import path from "path";
import fs from "fs";

export class MulterUtil {
    private readonly storagePath: string;
    private storage?: StorageEngine;

    public constructor(storagePath: string) {
        this.storagePath = storagePath;
        this.init();
    }

    private init() {
        if (!fs.existsSync(this.storagePath)) fs.mkdirSync(this.storagePath, {recursive: true});
        this.storage = multer.diskStorage({
            destination: (_req, _file, cb) => {
                cb(null, this.storagePath);
            },
            filename: (req, file, cb) => {
                const id = req.params.id;
                const ext = path.extname(file.originalname);
                cb(null, `${id}${ext}`);
            }
        });
    }

    public get upload(): multer.Multer {
        const storage = this.storage;
        return multer({
            storage,
            limits: {fileSize: 100 * 1024 * 1024}, // 100MB
            fileFilter: (_req, file, cb) => {
                // only accept images/videos
                if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) cb(null, true);
                else cb(new Error("Only image and video files are allowed"));
            }
        });
    }

}
