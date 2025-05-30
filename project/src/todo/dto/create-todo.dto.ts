export class CreateTaskDto {
  description: string;
  isCompleted?: boolean;
  todoListId: string;
  dueDate?: Date;
}