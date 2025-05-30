import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-todo.dto';

@Injectable()
export class TodoService {
    constructor(private prisma: PrismaService){}

    async createTodoList(userId: string, title:string){
        return this.prisma.todoList.create({data: {userId, title}})
    }

    async createTask(userId: string, dto: CreateTaskDto) {
        const task = await this.prisma.task.findUnique({
            where: { id: dto.todoListId },
        });

        if (!task || task.userId !== userId) {
            throw new ForbiddenException('You are not allowed to access these tasks');
        }

        return this.prisma.task.create({
            data: {
            ...dto,
            userId
            },
        });
    }       

    async deleteTask(userId:string, taskId:string){
        const task = await this.prisma.task.findUnique({
            where: { id: taskId,},
        });
        
        if (!task || task.userId !== userId) {
            throw new ForbiddenException('You are not allowed to access these tasks');
        }

        return this.prisma.task.delete({where: {id:taskId} })
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