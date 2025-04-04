import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

// Define interfaces for better type safety
interface FileUploadRequest extends Request {
    file?: Express.Multer.File;
}

interface MediaErrorResponse {
    error: string;
}

interface MediaSuccessResponse {
    message: string;
    id: string;
    filename: string;
}

// Create Express app
const app = express();
const PORT: number = parseInt(process.env.PORT || '3000');

// Configuration
const MEDIA_STORAGE_PATH: string = process.env.MEDIA_STORAGE_PATH || path.join(__dirname, 'media_storage');

// Create storage directory if it doesn't exist
if (!fs.existsSync(MEDIA_STORAGE_PATH)) {
    fs.mkdirSync(MEDIA_STORAGE_PATH, { recursive: true });
}

// Set up multer for file handling
const storage = multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, MEDIA_STORAGE_PATH);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        // Use the ID from the URL parameter as the filename
        const id = req.params.id;
        const extension = path.extname(file.originalname);
        cb(null, `${id}${extension}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB file size limit
    fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        // Only accept images and videos
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image and video files are allowed'));
        }
    }
});

// Middleware to parse JSON
app.use(express.json({ limit: '100mb' }));

// Logger middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(`Error: ${err.message}`);
    res.status(500).json({ error: err.message } as MediaErrorResponse);
});

// Types for file stats
interface FileInfo {
    filePath: string;
    contentType: string;
    size: number;
}

// Helper function to find and get file info
const getFileInfo = (id: string): Promise<FileInfo> => {
    return new Promise((resolve, reject) => {
        // Get all files in the storage directory
        fs.readdir(MEDIA_STORAGE_PATH, (err, files) => {
            if (err) {
                return reject(new Error(`Error reading directory: ${err.message}`));
            }

            // Find the file that starts with the requested ID
            const matchingFile = files.find(file => file.startsWith(id));

            if (!matchingFile) {
                return reject(new Error('File not found'));
            }

            const filePath = path.join(MEDIA_STORAGE_PATH, matchingFile);

            // Get file stats to determine content type
            fs.stat(filePath, (statErr, stats) => {
                if (statErr) {
                    return reject(new Error(`Error getting file stats: ${statErr.message}`));
                }

                // Determine content type based on file extension
                const extension = path.extname(matchingFile).toLowerCase();
                let contentType = 'application/octet-stream';

                if (extension === '.mp4') contentType = 'video/mp4';
                else if (extension === '.webm') contentType = 'video/webm';
                else if (extension === '.jpg' || extension === '.jpeg') contentType = 'image/jpeg';
                else if (extension === '.png') contentType = 'image/png';
                else if (extension === '.gif') contentType = 'image/gif';
                else if (extension === '.webp') contentType = 'image/webp';

                resolve({
                    filePath,
                    contentType,
                    size: stats.size
                });
            });
        });
    });
};

// Routes for video files
app.get('/videos/:id', async (req: Request, res: Response) => {
    try {
        const fileInfo = await getFileInfo(req.params.id);

        // Set appropriate headers
        res.setHeader('Content-Type', fileInfo.contentType);
        res.setHeader('Content-Length', fileInfo.size);

        // Stream the file
        const fileStream = fs.createReadStream(fileInfo.filePath);
        fileStream.pipe(res);
    } catch (error) {
        const err = error as Error;
        console.error(`Error retrieving video: ${err.message}`);

        if (err.message === 'File not found') {
            res.status(404).json({ error: 'Video not found' } as MediaErrorResponse);
        } else {
            res.status(500).json({ error: 'Internal server error' } as MediaErrorResponse);
        }
    }
});

app.post('/videos/:id', upload.single('media'), (req: FileUploadRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' } as MediaErrorResponse);
        }

        res.status(201).json({
            message: 'Media uploaded successfully',
            id: req.params.id,
            filename: req.file.filename
        } as MediaSuccessResponse);
    } catch (error) {
        const err = error as Error;
        console.error(`Error uploading video: ${err.message}`);
        res.status(500).json({ error: 'Internal server error' } as MediaErrorResponse);
    }
});

// Routes for image files
app.get('/images/:id', async (req: Request, res: Response) => {
    try {
        const fileInfo = await getFileInfo(req.params.id);

        // Set appropriate headers
        res.setHeader('Content-Type', fileInfo.contentType);
        res.setHeader('Content-Length', fileInfo.size);

        // Stream the file
        const fileStream = fs.createReadStream(fileInfo.filePath);
        fileStream.pipe(res);
    } catch (error) {
        const err = error as Error;
        console.error(`Error retrieving image: ${err.message}`);

        if (err.message === 'File not found') {
            res.status(404).json({ error: 'Image not found' } as MediaErrorResponse);
        } else {
            res.status(500).json({ error: 'Internal server error' } as MediaErrorResponse);
        }
    }
});

app.post('/images/:id', upload.single('media'), (req: FileUploadRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' } as MediaErrorResponse);
        }

        res.status(201).json({
            message: 'Media uploaded successfully',
            id: req.params.id,
            filename: req.file.filename
        } as MediaSuccessResponse);
    } catch (error) {
        const err = error as Error;
        console.error(`Error uploading image: ${err.message}`);
        res.status(500).json({ error: 'Internal server error' } as MediaErrorResponse);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Media server running on port ${PORT}`);
    console.log(`Media storage path: ${MEDIA_STORAGE_PATH}`);
});