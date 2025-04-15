import multer, {StorageEngine} from 'multer';
import path from 'path';
import fs from 'fs';

export class MulterConfig {
    private readonly mediaStoragePath: string;
    private storage?: StorageEngine;

    public constructor(mediaStoragePath: string) {
        this.mediaStoragePath = mediaStoragePath;
        this.init();
    }

    private init() {
        if (!fs.existsSync(this.mediaStoragePath)) fs.mkdirSync(this.mediaStoragePath, {recursive: true});
        this.storage = multer.diskStorage({
            destination: (_req, _file, cb) => {
                cb(null, this.mediaStoragePath);
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
                if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) cb(null, true);
                else cb(new Error('Only image and video files are allowed'));
            }
        });
    }

}
