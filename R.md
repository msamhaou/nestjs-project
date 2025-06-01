# TodoController API Documentation

_Base route: `/todo`_

_All routes require JWT authentication._

---

## 1. Create a Todo List

- **Method:** `POST`
- **Route:** `/todo`
- **Body:**

  ```json
  {
    "description": "string"
  }
