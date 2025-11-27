"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleImageUpload = void 0;
const handleImageUpload = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    // Return the public URL or relative path
    // For S3, req.file.location is the URL
    const imageUrl = req.file.location || `/uploads/${req.file.filename}`;
    return res.status(201).json({ imageUrl });
};
exports.handleImageUpload = handleImageUpload;
