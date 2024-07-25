// global.d.ts
import { Request } from 'express';
import { File } from 'multer';

declare global {
  namespace Express {
    interface Request {
      files?: File[];
    }
  }
}
