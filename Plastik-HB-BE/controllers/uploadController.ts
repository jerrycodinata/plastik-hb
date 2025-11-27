import { Request, Response } from "express";

export const handleImageUpload = (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    // Return the public URL or relative path
    // For S3, req.file.location is the URL
    const imageUrl = (req.file as any).location || `/uploads/${req.file.filename}`;
    return res.status(201).json({ imageUrl });
};