import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'ads');

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export const uploadAdImage = async (req: Request, res: Response, next: NextFunction) => {
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
    let base64Data: string;
    if (typeof image === 'string' && image.startsWith('data:')) {
      // Remove data URL prefix
      base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    } else {
      // Assume it's already base64
      base64Data = image;
    }

    if (!base64Data || base64Data.length < 100) {
      return res.status(400).json({ error: 'Invalid image data' });
    }

    console.log('[Upload] Base64 data length:', base64Data.length);

    let imageBuffer: Buffer;
    try {
      imageBuffer = Buffer.from(base64Data, 'base64');
    } catch (bufferError: any) {
      console.error('[Upload] Failed to create buffer:', bufferError);
      return res.status(400).json({ error: 'Invalid base64 data: ' + bufferError.message });
    }

    if (imageBuffer.length === 0) {
      return res.status(400).json({ error: 'Empty image buffer' });
    }

    console.log('[Upload] Image buffer size:', imageBuffer.length, 'bytes');

    // Generate unique filename with proper extension
    // Try to detect image type from base64 or default to jpg
    const filename = `${randomUUID()}.jpg`;
    const filepath = join(UPLOAD_DIR, filename);

    // Save file
    await writeFile(filepath, imageBuffer);
    console.log('[Upload] File saved to:', filepath);

    // Return the URL path
    const imageUrl = `/uploads/ads/${filename}`;
    
    res.json({ imageUrl });
  } catch (error: any) {
    console.error('[Upload] Error:', error);
    next(error);
  }
};
