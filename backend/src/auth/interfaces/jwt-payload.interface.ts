import { Role } from '../../common/enums/role.enum';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}