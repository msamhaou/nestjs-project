import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';
import { AuthController } from './auth.controller';
import { RedisService } from './redis.service';
import { JwtService } from '@nestjs/jwt';


describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
  };

  const mockRedis = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn()
  }


  const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.cookie = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
          
        },
        {
          provide: RedisService,
          useValue : mockRedis
        }
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should validate user, generate token and set cookie', async () => {
      const mockUser = { id: 'user-1', email: 'test@mail.com' };
      const mockTokens = { access_token: 'jwt-token' , refresh_token: 'refresh-token'};

      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(mockTokens);

      const res = mockResponse() as Response;

      const body = { email: 'test@mail.com', password: '123456789111' }
      const result = await controller.login(
        body,
        res,
      );
      expect(authService.validateUser).toHaveBeenCalledWith(body.email, body.password);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'jwt-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 15 * 60 * 1000,
        }),
      );
      expect(result).toEqual({ message: 'Logged in' , jwt: 'refresh-token', user_id:mockUser.id});
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto: RegisterDto = {
        email: 'test@mail.com',
        password: 'password123',
      };

      const mockRegisteredUser = { id: 'user-1', email: dto.email };
      mockAuthService.register.mockResolvedValue(mockRegisteredUser);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockRegisteredUser);
    });
  });
});
