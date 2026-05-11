import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

export const uploadImage = (buffer: Buffer, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `volunconnect/${folder}` },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      },
    );
    Readable.from(buffer).pipe(stream);
  });
};
