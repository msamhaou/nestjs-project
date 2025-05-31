import { Controller, Get, UseGuards, Req, Delete, Post, Body, Patch, Query, Param } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { CreateTaskDto } from './dto/create-todo.dto';
import { TodoService } from './todo.service';
import { UpdateTaskDto } from './dto/update-todo.dto';

@UseGuards(JwtGuard)
@Controller('todo')
export class TodoController {

    constructor(private todoService: TodoService){}

    @Post()
    createTodoList(@Req() req, @Body() body: {title: string}){
        const userId = req.user.userId;
        return this.todoService.createTodoList(userId, body.title);
    }

    @Get()
    getTodoLists(@Req() req){
        const userId = req.user.userId;
        return this.todoService.getTodoLists(userId);
    }

    @Post(':id/tasks')
    create_task(@Req() req, @Param('id') id: string, @Body() dto: CreateTaskDto){
        const userId = req.user.userId;
        return this.todoService.createTask(userId, id, dto);
    }


    @Get(':id/tasks')
    getTaskPage(@Req() req,
        @Param('id') todoListId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        ) {
        const userId = req.user.userId;
        const pageNum = page ? Number(page) : null;
        const limitNum = limit ? Number(limit) : null;

        if (pageNum && limitNum) {
            return this.todoService.getTasksPage(userId, pageNum, limitNum, todoListId);
        }

        return this.todoService.getAllTasks(userId, todoListId);
    }


    @Delete(':id/task')
    delete_task(@Req() req, @Body() body : {taskId: string}){
        return this.todoService.deleteTask(req.user.userId, body.taskId);
    }

    @Patch(':id/task')
    update_task(@Req() req, @Body() dto: UpdateTaskDto){
        return this.todoService.updateTask(req.user.userId, dto);
    }
}
