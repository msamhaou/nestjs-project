import { Controller, Get, UseGuards, Req, Delete, Post, Body } from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt.guard';
import { CreateTaskDto } from './dto/create-todo.dto';
import { TodoService } from './todo.service';

@UseGuards(JwtGuard)
@Controller('todo')
export class TodoController {

    constructor(private todoService: TodoService){}
    @Post('task')
    create_task(@Req() req, @Body() dto: CreateTaskDto){
        const userId = req.user.userId;
        return this.todoService.createTask(userId, dto)
    }
}
