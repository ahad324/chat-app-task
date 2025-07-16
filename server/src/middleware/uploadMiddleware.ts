import multer from 'multer';
import path from 'path';
import { Request } from 'express';

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: any, cb: multer.FileFilterCallback) => {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error(`Error: File upload only supports the following filetypes - ${filetypes}`));
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB file size limit
});

export { upload };
