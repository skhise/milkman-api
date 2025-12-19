"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAdImage = void 0;
const crypto_1 = require("crypto");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const fs_1 = require("fs");
const UPLOAD_DIR = (0, path_1.join)(process.cwd(), 'uploads', 'ads');
// Ensure upload directory exists
async function ensureUploadDir() {
    if (!(0, fs_1.existsSync)(UPLOAD_DIR)) {
        await (0, promises_1.mkdir)(UPLOAD_DIR, { recursive: true });
    }
}
const uploadAdImage = async (req, res, next) => {
    try {
        await ensureUploadDir();
        // For React Native, we'll receive base64 image data
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ error: 'Image data is required' });
        }
        console.log('[Upload] Received image data, length:', image?.length || 0);
        console.log('[Upload] Image data preview:', image?.substring(0, 50) || 'N/A');
        // Extract base64 data (handle data:image/png;base64, prefix)
        let base64Data;
        if (typeof image === 'string' && image.startsWith('data:')) {
            // Remove data URL prefix
            base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        }
        else {
            // Assume it's already base64
            base64Data = image;
        }
        if (!base64Data || base64Data.length < 100) {
            return res.status(400).json({ error: 'Invalid image data' });
        }
        console.log('[Upload] Base64 data length:', base64Data.length);
        let imageBuffer;
        try {
            imageBuffer = Buffer.from(base64Data, 'base64');
        }
        catch (bufferError) {
            console.error('[Upload] Failed to create buffer:', bufferError);
            return res.status(400).json({ error: 'Invalid base64 data: ' + bufferError.message });
        }
        if (imageBuffer.length === 0) {
            return res.status(400).json({ error: 'Empty image buffer' });
        }
        console.log('[Upload] Image buffer size:', imageBuffer.length, 'bytes');
        // Generate unique filename with proper extension
        // Try to detect image type from base64 or default to jpg
        const filename = `${(0, crypto_1.randomUUID)()}.jpg`;
        const filepath = (0, path_1.join)(UPLOAD_DIR, filename);
        // Save file
        await (0, promises_1.writeFile)(filepath, imageBuffer);
        console.log('[Upload] File saved to:', filepath);
        // Return the URL path
        const imageUrl = `/uploads/ads/${filename}`;
        res.json({ imageUrl });
    }
    catch (error) {
        console.error('[Upload] Error:', error);
        next(error);
    }
};
exports.uploadAdImage = uploadAdImage;
//# sourceMappingURL=ads.upload.js.map