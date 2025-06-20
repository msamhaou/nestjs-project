import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from './redis.service';
import { use } from 'passport';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly redisService: RedisService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });
    await this.redisService.set(`refresh_token:${user.id}`, refresh_token, 7 * 24 * 60 * 60);
    return { access_token, refresh_token };
  }

  async register(dto: { email: string; password: string;  }) {

    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }


    const hashedPassword = await bcrypt.hash(dto.password, 10);


    const newUser = await this.usersService.createUser({
      ...dto,
      password: hashedPassword,
    });


    const { password, ...result } = newUser;
    return result;
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = this.createRandomToken();

    await this.redisService.set(`refresh_token:${userId}`, refreshToken, 604800);

    return refreshToken;
  }

  async validateRefreshToken(userId: string, token: string): Promise<boolean> {
    const storedToken = await this.redisService.get(`refresh_token:${userId}`);
    return storedToken === token;
  }

  async refreshToken(userId: string, refreshToken: string) {
    const isValid = await this.validateRefreshToken(userId, refreshToken);
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    const accessToken = this.jwtService.sign({ sub: userId });

    const newRefreshToken = await this.generateRefreshToken(userId);

    return { accessToken, refreshToken: newRefreshToken };
  }

  private createRandomToken() {
    return crypto.randomBytes(64).toString('hex');
  }

  async logout(userId: number) {
    await this.redisService.del(`refresh_token:${userId}`);
  }
}
