import { User } from '../users/user.schema';

declare global {
  namespace Express {
    interface Request {
      user?: any; // or User type later
    }
  }
}