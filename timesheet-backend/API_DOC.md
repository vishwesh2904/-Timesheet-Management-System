# Timesheet Management System API Documentation

## Authentication

### Register
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "yourpassword",
    "role": "associate" // or "manager"
  }
  ```
- **Response:** 201 Created / 409 Conflict / 400 Bad Request

### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "yourpassword"
  }
  ```
- **Response:** 200 OK (returns JWT token)

### Profile (Protected)
- **GET** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** 200 OK (user info)

---

## Tasks

### Assign Task (Manager only)
- **POST** `/api/tasks/assign`
- **Headers:** `Authorization: Bearer <manager_token>`
- **Body:**
  ```json
  {
    "description": "Fix Bug A",
    "estimatedHours": 4,
    "date": "2025-05-23",
    "assignedTo": "<associate_user_id>"
  }
  ```
- **Response:** 201 Created

### Get All Tasks (Manager only)
- **GET** `/api/tasks/all`
- **Headers:** `Authorization: Bearer <manager_token>`
- **Response:** 200 OK (list of all tasks)

### Get My Tasks (Associate only)
- **GET** `/api/tasks/my`
- **Headers:** `Authorization: Bearer <associate_token>`
- **Response:** 200 OK (list of assigned tasks)

---

## Timesheets

### Save Timesheet as Draft (Associate only)
- **POST** `/api/timesheets/save`
- **Headers:** `Authorization: Bearer <associate_token>`
- **Body:**
  ```json
  {
    "weekStart": "2025-05-19",
    "entries": [
      {
        "taskId": "<task_id>",
        "date": "2025-05-20",
        "actualHours": 3
      }
    ]
  }
  ```
- **Response:** 200 OK

### Submit Timesheet (Associate only)
- **POST** `/api/timesheets/submit`
- **Headers:** `Authorization: Bearer <associate_token>`
- **Body:**
  ```json
  {
    "weekStart": "2025-05-19"
  }
  ```
- **Response:** 200 OK

### Get My Timesheets (Associate only)
- **GET** `/api/timesheets/my`
- **Headers:** `Authorization: Bearer <associate_token>`
- **Response:** 200 OK (list of timesheets)

### Get All Timesheets (Manager only)
- **GET** `/api/timesheets/all`
- **Headers:** `Authorization: Bearer <manager_token>`
- **Response:** 200 OK (list of all timesheets)

---

## Notes
- All protected routes require the `Authorization: <token>` header.
- Only managers can assign tasks and view all tasks/timesheets.
- Only associates can submit and view their own tasks/timesheets.
- Once a timesheet is submitted, it cannot be edited.
