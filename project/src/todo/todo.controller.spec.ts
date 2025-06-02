import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { title } from 'process';

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

  const mockPrisma = {
  todoList: {
    $transaction: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
  task: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
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

  describe('TodoService', () => {
    let service: TodoService;
    const userId = "user-1"
    beforeEach(async ()=> {
      const module: TestingModule = await Test.createTestingModule({
        providers:[
          TodoService,
          {
            provide: PrismaService,
            useValue: mockPrisma
          }
        ]
      }).compile();
      service = module.get<TodoService>(TodoService);
    });

    afterEach(() => jest.clearAllMocks() )

    describe('createTodoList', () => {
      it('throws if title is missing', async() => {
        await expect(service.createTodoList(userId, ''))
          .rejects.toThrow(BadRequestException);
      });

      it('creates a todo list', async() => {
        mockPrisma.todoList.create.mockResolvedValue({id:'task1', title: 'test'})
        const result = await service.createTodoList(userId, 'test')
        expect(result).toEqual({id:'task1', title: 'test'})
      })

    });

    describe('createTask', () => {
      const dto: CreateTaskDto = { description: 'task description '};

      it('throws if todoListId is missing', async ()=> {
        await expect(service.createTask(userId, '', dto)).rejects.toThrow(BadRequestException);
      });

      it('throws if description is missing', async () => {
        await expect(service.createTask(userId, 'todo-1', {description:''})).rejects.toThrow(BadRequestException);
      });

      it('creates task if valid', async () => {
        mockPrisma.todoList.findUnique.mockResolvedValue({ id:'todo1', userId: userId });
        mockPrisma.task.create.mockResolvedValue({ id: 'task1', ...dto,todoListId: 'todo1' })
        const result = await service.createTask(userId, 'todo1', dto);
        expect(result).toEqual({id: 'task1',...dto, todoListId: 'todo1'})
      });

      it('throws if user not owning task', async () => {
        const realOwnerId = 'user-2';
        const userId = 'user-1';
        const todoListId = 'todo2';

        mockPrisma.todoList.findUnique.mockResolvedValue({ id: todoListId, userId: realOwnerId });

        await expect(service.createTask(userId, todoListId, dto))
          .rejects.toThrow(new ForbiddenException('You are not allowed to access this todo list'));
      })

      it('throws if todo list Id doesnt exist', async () => {
        const userId = 'user-1';
        const todoListId = 'todo2';
        const dto = { description: 'task' };

        mockPrisma.todoList.findUnique.mockResolvedValue(null);

        await expect(service.createTask(userId, todoListId, dto))
          .rejects.toThrow(new ForbiddenException(`todo list ID: ${todoListId} does not exist`));
      })

    })

    describe('deleteTask', () => {
      const userId = 'user-1';
      const taskId = 'task-123';

      it('should throw BadRequestException if taskId is missing', async () => {
        await expect(service.deleteTask(userId, ''))
          .rejects
          .toThrow(new BadRequestException('Missing taskId'));
      });

      it('should throw ForbiddenException if task not found', async () => {
        mockPrisma.task.findUnique.mockResolvedValue(null);

        await expect(service.deleteTask(userId, taskId))
          .rejects
          .toThrow(new ForbiddenException('You are not allowed to access these tasks'));
      });

      it('should throw ForbiddenException if task belongs to different user', async () => {
        mockPrisma.task.findUnique.mockResolvedValue({ id: taskId, userId: 'user-2' });

        await expect(service.deleteTask(userId, taskId))
          .rejects
          .toThrow(new ForbiddenException('You are not allowed to access these tasks'));
      });

      it('should delete task if user owns the task', async () => {
        const task = { id: taskId, userId };

        mockPrisma.task.findUnique.mockResolvedValue(task);
        mockPrisma.task.delete.mockResolvedValue({ ...task, deleted: true });

        const result = await service.deleteTask(userId, taskId);
        expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({ where: { id: taskId } });
        expect(mockPrisma.task.delete).toHaveBeenCalledWith({ where: { id: taskId } });
        expect(result).toEqual({ ...task, deleted: true });
      });
    });

    // describe('getTasksPage', () => {
    //     const userId = 'user-1';
    //     const todoListId = 'todo-123';
    //     const page = 2;
    //     const limit = 5;

    //     it('should return paginated tasks with meta info', async () => {
    //       const mockTasks = [
    //         { id: 'task1', userId, todoListId, description: 'task 1' },
    //         { id: 'task2', userId, todoListId, description: 'task 2' },
    //       ];
    //       const mockTotal = 12;

    //       mockPrisma.$transaction.mockResolvedValue([mockTasks, mockTotal]);

    //       const result = await service.getTasksPage(userId, page, limit, todoListId);

    //       expect(mockPrisma.$transaction).toHaveBeenCalledWith([
    //         expect.objectContaining({
    //           where: { userId, todoListId },
    //           skip: (page - 1) * limit,
    //           take: limit,
    //           orderBy: { createdAt: 'desc' },
    //         }),
    //         expect.objectContaining({
    //           where: { userId },
    //         }),
    //       ]);

    //       expect(result).toEqual({
    //         data: mockTasks,
    //         meta: {
    //           total: mockTotal,
    //           page,
    //           lastPage: Math.ceil(mockTotal / limit),
    //         },
    //       });
    //     });

    //     it('should handle zero tasks gracefully', async () => {
    //       mockPrisma.$transaction.mockResolvedValue([[], 0]);

    //       const result = await service.getTasksPage(userId, 1, 10, todoListId);

    //       expect(result).toEqual({
    //         data: [],
    //         meta: {
    //           total: 0,
    //           page: 1,
    //           lastPage: 0,
    //         },
    //       });
    //     });
    //   });
    describe('getAllTasks', () => {
      const todoListId = 'todo1';
      const userId = 'user-1'
      const mockTasks = [
            { id: 'task1', userId, todoListId, description: 'task 1' },
            { id: 'task2', userId, todoListId, description: 'task 2' },
          ];

      it('should return all tasks in todo list', async () => {
        mockPrisma.todoList.findUnique.mockResolvedValue({id:todoListId, userId: userId});
        mockPrisma.task.findMany.mockResolvedValue(mockTasks)
        
        const tasks = await service.getAllTasks(userId, todoListId);

        expect(mockPrisma.task.findMany).toHaveBeenCalledWith({where: { todoListId },orderBy: { createdAt: 'desc' } })
        expect(tasks)
          .toEqual(mockTasks)
      })

      it('should throw BadRequestException if taskId is missing', async () => {
        const taskNull = ''
        mockPrisma.todoList.findUnique({id:todoListId, userId: userId});
        mockPrisma.task.findMany.mockResolvedValue(mockTasks)
        await expect(service.getAllTasks(userId, taskNull))
          .rejects
          .toThrow(new BadRequestException('Missing todoListId'));
      });

      it('should throw ForbiddenException if todo list belongs to different user', async () => {
        const unownedListId = 'todo2'
        const realOwner = 'user-2'
        mockPrisma.todoList.findUnique.mockResolvedValue({ id: unownedListId, userId: realOwner });

        await expect(service.getAllTasks(userId, unownedListId))
          .rejects
          .toThrow(new ForbiddenException('You are not allowed to access these tasks'));
      });
    })
  })
});
