import { User } from '../usersschemas/user.schema';

declare global {
  namespace Express {
    interface Request {
      user?: User; // or User type later
    }
  }
}