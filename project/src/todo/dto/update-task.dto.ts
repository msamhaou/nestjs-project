export class UpdateTaskDto {
  taskId: string;
  description?: string;
  isCompleted?: boolean;
  dueDate?: Date;
}