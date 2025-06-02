# Task Management API
* [Requirement](#requirement)
* [Documentaion](#documentaion)
* [File_structure](#File_structure)
* [run the application](#Run)
    

# Requirements:

  ![Docker](https://img.shields.io/badge/Docker-required-blue?logo=docker)
  - Docker containerization platform

  ![Make](https://img.shields.io/badge/Make-required-blue?logo=gnu)
  - Make build automation tool

  ![Linux](https://img.shields.io/badge/Linux-recommended-green?logo=linux)
  - (Recommended) Linux environment

---

# File_structure:
```
task_managment_api/
    ├── projet
        ├──src
        |    ├──auth
        |    ├──todo
        |    ├──users
        ├── prisma
             ├──prisma.schema
    └──infra
        ├──docker-compose.yaml
        └──Dockerfile
    ├──Makefile
    └── README.md
```
# Run:
  ```
    make
  ```
  to run test , make sure nest application is running :
  ```
    make test
  ```
# Documentaion:

###  Create a Todo List
- **Method:** `POST`

- **Route:** `/todo`

- **Body:**

    ```json
    {
    "title": "string"
    }

**Description:**
`Creates a new todo list for the authenticated user.`

- **Response:** `The created todo list object.`

###  Get All Todo Lists
- **Method:** `GET`

- **Route:** `/todo`

- **Description:**
`Retrieves all todo lists belonging to the authenticated user.`

**Response:** `Array of todo list objects.`

###  Get Tasks for a Todo List (with optional pagination)
- **Method:** `GET`

- **Route:** `/todo/:id/tasks`

- **Params:**

- **id (string):** `The UUID of the todo list.`

- **Query Params (optional):**

  - page (number): `Page number for pagination.`

  - limit (number): `Number of tasks per page.`

- **URL example:** `GET /todo/123e4567-e89b-12d3-a456-426614174000/tasks?page=2&limit=10`


###  Create a Task in a Todo List
**Method:** `POST`

**Route:** `/todo/:id/tasks`

**Params:**

**id (string):** `The UUID of the todo list.`

**Body:**
```json
  {
    "description" : "example",
    "isCompleted" : false, //optional
    "dueDate": "2025-06-01T00:00:00.000Z" //optional
  }
  ```

**Description:**
`Adds a new task to the todo list identified by id.`

**Response:** `The created task object.`

###  Get Tasks for a Todo List (with optional pagination)
**Method:** `GET`

**Route:** `/todo/:id/tasks`

**Params:**

**id (string):** `The UUID of the todo list.`

**Query Params (optional):**

**page (number):** `Page number for pagination.`

**limit (number):** `Number of tasks per page.`

**Description:**
`Retrieves tasks belonging to the todo list. If page and limit are provided, returns paginated tasks; otherwise returns all tasks.`

**Response:**

If paginated, returns:


  ```json
  {
    "data": [/* array of task objects */],
    "meta": {
      "total": number,
      "page": number,
      "lastPage": number
    }
  }
  ```

If no pagination params, returns an array of all tasks.

###  Delete a Task
**Method:** `DELETE`

**Route:** `/todo/:id/task`

**Params:**

**id (string):** `The UUID of the todo list (used for routing but not required in body).`

**Body:**

  ```json
  {
    "taskId": "string"
  }
  ```

**Description:**
`Deletes a task identified by taskId belonging to the authenticated user.`

**Response:** `Result of the delete operation.`

###  Update a Task
**Method:** `PATCH`

**Route:** `/todo/:id/task`

**Params:**

**id (string):** `The UUID of the todo list.`

**Body:**
`UpdateTaskDto object containing the fields to update, e.g.:`

  ```json
  {
    "taskId": "string",
    "description": "string",
    "isCompleted": true,
    "dueDate": "2025-06-01T00:00:00.000Z"
  }
  ```
**Description:**
`Updates the specified task with the given fields.`

**Response:** `The updated task object.`