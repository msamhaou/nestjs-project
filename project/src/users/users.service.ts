import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id){
    return this.prisma.user.findUnique({where : {id}})
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  async createUser(data: { email: string; password: string; name?: string }) {
    return this.prisma.user.create({
      data,
    });
  }
}
