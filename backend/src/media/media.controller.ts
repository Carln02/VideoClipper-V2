import {Request, Response} from "express";
import {MediaRepository} from "./media.repository";

export class MediaController {
    public constructor(private readonly mediaRepo: MediaRepository) {}

    public getMedia = async (req: Request, res: Response) => {
        try {
            const fileInfo = await this.mediaRepo.getFileInfo(req.params.id);
            res.setHeader("Content-Type", fileInfo.contentType);
            res.setHeader("Content-Length", fileInfo.size.toString());
            this.mediaRepo.createReadStream(fileInfo.filePath).pipe(res);
        } catch (err: any) {
            console.error(`Error retrieving media: ${err.message}`);
            if (err.message === "File not found") res.status(404).json({error: "Media not found"});
            else res.status(500).json({error: "Internal server error"});
        }
    };

    public uploadMedia = async (req: Request, res: Response) => {
        try {
            if (!req.file) return res.status(400).json({error: "No file uploaded"});

            res.status(201).json({
                message: "Media uploaded successfully",
                id: req.params.id,
                filename: req.file.filename
            });
        } catch (err: any) {
            console.error(`Error uploading media: ${err.message}`);
            res.status(500).json({error: "Internal server error"});
        }
    };
}