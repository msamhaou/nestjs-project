# TodoController API Documentation

_Base route: /todo

_All routes are protected with JWT authentication guard.

---

## 1. Create a Todo List
- **Method:** `POST`

- **Route:** `/todo`

- **Body:**

    ```json
    {
    "title": "string"
    }

**Description:**
Creates a new todo list for the authenticated user.

Response: The created todo list object.

## 2. Get All Todo Lists
- **Method:** `GET`

- **Route:** `/todo`

- **Description:**
`Retrieves all todo lists belonging to the authenticated user.`

Response: Array of todo list objects.

3. Create a Task in a Todo List
Method: POST

Route: /todo/:id/tasks

Params:

id (string): The UUID of the todo list.

Body:
CreateTaskDto object (task details).

Description:
Adds a new task to the todo list identified by id.

Response: The created task object.

4. Get Tasks for a Todo List (with optional pagination)
Method: GET

Route: /todo/:id/tasks

Params:

id (string): The UUID of the todo list.

Query Params (optional):

page (number): Page number for pagination.

limit (number): Number of tasks per page.

Description:
Retrieves tasks belonging to the todo list. If page and limit are provided, returns paginated tasks; otherwise returns all tasks.

Response:

If paginated, returns:

json
Copy
Edit
{
  "data": [/* array of task objects */],
  "meta": {
    "total": number,
    "page": number,
    "lastPage": number
  }
}
If no pagination params, returns an array of all tasks.

5. Delete a Task
Method: DELETE

Route: /todo/:id/task

Params:

id (string): The UUID of the todo list (used for routing but not required in body).

Body:

json
Copy
Edit
{
  "taskId": "string"
}
Description:
Deletes a task identified by taskId belonging to the authenticated user.

Response: Result of the delete operation.

6. Update a Task
Method: PATCH

Route: /todo/:id/task

Params:

id (string): The UUID of the todo list.

Body:
UpdateTaskDto object containing the fields to update, e.g.:

json
Copy
Edit
{
  "taskId": "string",
  "description": "string",
  "isCompleted": true,
  "dueDate": "2025-06-01T00:00:00.000Z"
}
Description:
Updates the specified task with the given fields.

Response: The updated task object.