import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-todo.dto';

@Injectable()
export class TodoService {
    constructor(private prisma: PrismaService){}

    async createTodoList(userId: string, title:string){
        return this.prisma.todoList.create({data: {userId, title}})
    }

    async createTask(userId:string, todoListId: string, dto: CreateTaskDto){
        return this.prisma.task.create({data: {todoListId, description:dto.description}})
    }

    async getAllTasks(userId: string, todoListId:string) {
        // Step 1: Get user's todo list
        const todoList = await this.prisma.todoList.findUnique({
            where: { id: todoListId },
        });

        if (!todoList || todoList.userId !== userId) {
            throw new ForbiddenException('You are not allowed to access these tasks');
        }

        // Step 2: Get all tasks for the list
        return this.prisma.task.findMany({
            where: { todoListId },
            orderBy: { createdAt: 'desc' }, // optional
        });
    }
}