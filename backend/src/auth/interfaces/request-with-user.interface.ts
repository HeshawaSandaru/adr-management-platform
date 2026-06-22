import { Request } from 'express';
import { Role } from '../../common/enums/role.enum';

export interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: Role;
  };
}