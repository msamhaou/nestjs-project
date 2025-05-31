import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { CreateTaskDto } from './dto/create-todo.dto';
import { UpdateTaskDto } from './dto/update-todo.dto';

const mockRequest = {
  user: { userId: 'user-123' },
};

describe('TodoController', () => {
  let controller: TodoController;
  let service: TodoService;

  const mockService = {
    createTodoList: jest.fn(),
    getTodoLists: jest.fn(),
    createTask: jest.fn(),
    getTasksPage: jest.fn(),
    getAllTasks: jest.fn(),
    deleteTask: jest.fn(),
    updateTask: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TodoController>(TodoController);
    service = module.get<TodoService>(TodoService);
  });

  it('should create a todo list', async () => {
    mockService.createTodoList.mockResolvedValue({ id: 'list-1', title: 'My List' });
    const result = await controller.createTodoList(mockRequest, { title: 'My List' });
    expect(result).toEqual({ id: 'list-1', title: 'My List' });
    expect(service.createTodoList).toHaveBeenCalledWith('user-123', 'My List');
  });

  it('should get all todo lists', async () => {
    mockService.getTodoLists.mockResolvedValue(['list1', 'list2']);
    const result = await controller.getTodoLists(mockRequest);
    expect(result).toEqual(['list1', 'list2']);
  });

  it('should create a task', async () => {
    const dto: CreateTaskDto = { description: 'New task' };
    mockService.createTask.mockResolvedValue({ id: 'task-1', ...dto });
    const result = await controller.create_task(mockRequest, 'list-1', dto);
    expect(result).toEqual({ id: 'task-1', description: 'New task' });
    expect(service.createTask).toHaveBeenCalledWith('user-123', 'list-1', dto);
  });

  it('should get paginated tasks', async () => {
    mockService.getTasksPage.mockResolvedValue({ data: [], meta: {} });
    const result = await controller.getTaskPage(mockRequest, 'list-1', '1', '10');
    expect(service.getTasksPage).toHaveBeenCalledWith('user-123', 1, 10, 'list-1');
    expect(result).toEqual({ data: [], meta: {} });
  });

  it('should get all tasks if no pagination', async () => {
    mockService.getAllTasks.mockResolvedValue(['task1', 'task2']);
    const result = await controller.getTaskPage(mockRequest, 'list-1');
    expect(service.getAllTasks).toHaveBeenCalledWith('user-123', 'list-1');
    expect(result).toEqual(['task1', 'task2']);
  });

  it('should delete a task', async () => {
    mockService.deleteTask.mockResolvedValue({ success: true });
    const result = await controller.delete_task(mockRequest, { taskId: 'task-123' });
    expect(service.deleteTask).toHaveBeenCalledWith('user-123', 'task-123');
    expect(result).toEqual({ success: true });
  });

  it('should update a task', async () => {
    const dto: UpdateTaskDto = { taskId: 'task-1', description: 'Updated' };
    mockService.updateTask.mockResolvedValue({ id: 'task-1', description: 'Updated' });
    const result = await controller.update_task(mockRequest, dto);
    expect(service.updateTask).toHaveBeenCalledWith('user-123', dto);
    expect(result).toEqual({ id: 'task-1', description: 'Updated' });
  });
});
