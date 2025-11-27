import { Router } from "express";
import { handleImageUpload } from "../controllers/uploadController";
import { uploadProduct } from "../utils/uploadImageMiddleware";
import multer from "multer";

const router = Router();

// Use the S3-configured multer instance
router.post("/", uploadProduct.single("image"), handleImageUpload);

// --- Multer error handler for invalid file type ---
router.use((err: any, req: any, res: any, next: any) => {
    if (err instanceof multer.MulterError || err.message === "Only image files are allowed!") {
        return res.status(400).json({ error: err.message });
    }
    next(err);
});

export default router;