export class CreateTaskDto {
  description: string;
  isCompleted?: boolean;
  dueDate?: Date;
}