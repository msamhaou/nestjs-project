import { Controller, Post, Body, Res } from '@nestjs/common';
import {Response} from 'express'
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

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
}
