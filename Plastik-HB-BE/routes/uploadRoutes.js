"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const uploadController_1 = require("../controllers/uploadController");
// --- Accept only image files ---
const imageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const fileFilter = (_, file, cb) => {
    if (imageMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Only image files are allowed!"));
    }
};
const uploadDir = "uploads/";
const storage = multer_1.default.diskStorage({
    destination: uploadDir,
    filename: (_, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});
const upload = (0, multer_1.default)({ storage, fileFilter });
const router = (0, express_1.Router)();
router.post("/", upload.single("image"), uploadController_1.handleImageUpload);
// --- Multer error handler for invalid file type ---
router.use((err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError || err.message === "Only image files are allowed!") {
        return res.status(400).json({ error: err.message });
    }
    next(err);
});
exports.default = router;
