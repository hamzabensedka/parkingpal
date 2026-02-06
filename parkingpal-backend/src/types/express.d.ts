import { User } from '@prisma/client';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        userType: string;
      };
    }
  }
}

// Extend Express Multer File
declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
  }
}

export {};
