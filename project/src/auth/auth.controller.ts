import { Controller, Post, Body, Res, Req, UnauthorizedException } from '@nestjs/common';
import {Response} from 'express'
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string },
   @Res({ passthrough: true }) response: Response,
) {
    const user = await this.authService.validateUser(body.email, body.password);
    const tokens = await this.authService.login(user);
     response.cookie('access_token', tokens.access_token, {
      httpOnly: true,             
      secure: process.env.NODE_ENV === 'production',  
      sameSite: 'lax',           
      maxAge: 15 * 60 * 1000,
    });

    return { message: 'Logged in' };
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');

    const userId = req.cookies['user_id'];

    const tokens = await this.authService.refreshToken(userId, refreshToken);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    return { message: 'Tokens refreshed' };
  }
}
