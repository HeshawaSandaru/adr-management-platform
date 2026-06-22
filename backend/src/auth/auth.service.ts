import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/role.enum';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // =========================
  // REGISTER USER
  // =========================
  async register(dto: RegisterDto) {
  // Check if user already exists
    const exists = await this.usersService.findByEmail(dto.email);

    if (exists) {
      throw new ConflictException('Email is already registered');
    }

    const user = await this.usersService.create(
      dto.name,
      dto.email,
      dto.password
    );

    return {
      message: 'User registered successfully',
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
    };
  }

  // =========================
  // LOGIN USER
  // =========================
  async login(dto: { email: string; password: string }) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return {
      message: 'Login successful',
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
    };
  }

  // =========================
  // GET PROFILE
  // =========================
  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}