import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-todo.dto';
import { UpdateTaskDto } from './dto/update-todo.dto';

@Injectable()
export class TodoService {
    constructor(private prisma: PrismaService){}

    async createTodoList(userId: string, title:string){
        if (!title) {
            throw new BadRequestException('Missing todoListId');
        }
        return this.prisma.todoList.create({data: { userId, title }})
    }

    async createTask(userId: string, todoListId:string, dto: CreateTaskDto) {
        console.log("dt ", dto)
        if (!todoListId) {
            throw new BadRequestException('Create Task : Missing todoListId');
        }if (!dto.description){
            throw new BadRequestException('Create Task : Missing description');
        }
        const todo = await this.prisma.todoList.findUnique({
            where: { id: todoListId },
        });
        
        if (!todo)
            throw new ForbiddenException(`todo list ID: ${todoListId} does not exist`);
        if (todo.userId !== userId) {
            throw new ForbiddenException('You are not allowed to access this todo list');
        }

        return this.prisma.task.create({
            data: {
            ...dto,
            todoListId,
            userId
            },
        });
    }


    async getTodoLists(userId: string){
        return this.prisma.todoList.findMany({where: { userId }})
    }

    async deleteTask(userId:string, taskId:string){
        if (!taskId) {
            throw new BadRequestException('Missing taskId');
          }
        const task = await this.prisma.task.findUnique({
            where: { id: taskId,},
        });
        
        if (!task || task.userId !== userId) {
            throw new ForbiddenException('You are not allowed to access these tasks');
        }

        return this.prisma.task.delete({where: {id:taskId} })
    }

    async getTasksPage(userId:string, page:number, limit: number, todoListId:string){
        const skip = (page - 1) * limit;

        const [items, total] = await this.prisma.$transaction([
            this.prisma.task.findMany({
            where: { userId, todoListId },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            }),
            this.prisma.todoList.count({
            where: { userId },
            }),
        ]);

        return {
            data: items,
            meta: {
            total,
            page,
            lastPage: Math.ceil(total / limit),
            },
        };
    }

    async getAllTasks(userId: string, todoListId:string) {
        if (!todoListId) {
            throw new BadRequestException('Missing todoListId');
          }
        const todoList = await this.prisma.todoList.findUnique({
            where: { id: todoListId },
        });

        if (!todoList || todoList.userId !== userId) {
            throw new ForbiddenException('You are not allowed to access these tasks');
        }

        return this.prisma.task.findMany({
            where: { todoListId },
            orderBy: { createdAt: 'desc' }, 
        });
    }

    async updateTask(userId: string, dto: UpdateTaskDto){
        if (!dto || !dto.taskId) {
            throw new BadRequestException('Missing taskId');
        }

        const task = await this.prisma.task.findUnique({where: {id: dto.taskId}})

        if (!task || task.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }
        
        const updateData: any = {};
        if (dto.description !== undefined) updateData.description = dto.description;
        if (dto.isCompleted !== undefined) updateData.isCompleted = dto.isCompleted;
        if (dto.dueDate !== undefined) updateData.dueDate = dto.dueDate;

        return this.prisma.task.update({
            where: { id: dto.taskId },
            data: updateData,
        });
                
    }

}