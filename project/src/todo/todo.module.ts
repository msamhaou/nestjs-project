import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';

@Module({
  providers: [TodoService],
  controllers: [TodoController],
  exports: [TodoService], // <-- export it so other modules can use it
})
export class TodoModule {}
