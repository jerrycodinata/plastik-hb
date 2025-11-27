"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileManager = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const s3 = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
});
class FileManager {
    static getKeyFromUrl(url) {
        if (!url)
            return null;
        if (!url.startsWith('http'))
            return url; // Assume it's a key if not http
        try {
            const urlObj = new URL(url);
            // pathname includes the leading slash, remove it. Also decodeURI in case of spaces etc.
            return decodeURIComponent(urlObj.pathname.substring(1));
        }
        catch {
            return null;
        }
    }
    /**
     * Delete file from S3
     */
    static async deleteFile(filename) {
        try {
            if (!filename || filename === '/placeholder.jpg') {
                return false;
            }
            const key = this.getKeyFromUrl(filename);
            if (!key)
                return false;
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key
            });
            await s3.send(command);
            console.log(`✅ File deleted from S3: ${key}`);
            return true;
        }
        catch (error) {
            console.error(`❌ Error deleting file ${filename} from S3:`, error);
            return false;
        }
    }
    /**
     * Delete multiple files
     */
    static async deleteFiles(filenames) {
        await Promise.all(filenames.map(filename => {
            if (filename && filename !== '/placeholder.jpg') {
                return this.deleteFile(filename);
            }
            return Promise.resolve(false);
        }));
    }
    /**
     * Check if file exists (S3 HeadObject)
     */
    static async fileExists(filename) {
        try {
            if (!filename || filename === '/placeholder.jpg') {
                return false;
            }
            const key = this.getKeyFromUrl(filename);
            if (!key)
                return false;
            const command = new client_s3_1.HeadObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key
            });
            await s3.send(command);
            return true;
        }
        catch (error) {
            // console.error(`Error checking file ${filename}:`, error);
            return false;
        }
    }
    /**
     * Get file size
     */
    static async getFileSize(filename) {
        try {
            if (!filename || filename === '/placeholder.jpg') {
                return 0;
            }
            const key = this.getKeyFromUrl(filename);
            if (!key)
                return 0;
            const command = new client_s3_1.HeadObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key
            });
            const response = await s3.send(command);
            return response.ContentLength || 0;
        }
        catch (error) {
            console.error(`Error getting file size ${filename}:`, error);
            return 0;
        }
    }
    /**
     * Clean up failed uploads
     */
    static async cleanupFailedUpload(files) {
        try {
            if (Array.isArray(files)) {
                // For multer-s3, the file object has 'key' or 'location'
                const filenames = files.map(file => file.key || file.location || file.filename);
                await this.deleteFiles(filenames);
            }
            else if (files) {
                const filename = files.key || files.location || files.filename;
                await this.deleteFile(filename);
            }
        }
        catch (error) {
            console.error('Error cleaning up failed upload:', error);
        }
    }
}
exports.FileManager = FileManager;
