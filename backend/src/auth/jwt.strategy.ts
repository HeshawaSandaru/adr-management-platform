import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    
    if (!Object.values(Role).includes(payload.role)) {
      throw new UnauthorizedException('Invalid role');
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role as Role,
    };
  }
}
