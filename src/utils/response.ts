import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  data: unknown,
  message = 'OK',
  statusCode = 200,
) => {
  res.status(statusCode).json({ success: true, data, message });
};
