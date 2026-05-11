import { Request, Response, NextFunction } from 'express';
import { uploadImage } from '../../utils/upload';

export const uploadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Không có file được tải lên' });
      return;
    }

    const folder = (req.query.folder as string) || 'general';
    const url = await uploadImage(req.file.buffer, folder);

    res.status(200).json({ url });
  } catch (err) {
    next(err);
  }
};
