# Healthcare App API Documentation

## Dashboard APIs

### Base URL

All dashboard endpoints are prefixed with `/api/dashboard`

### Authentication

All dashboard endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Patient Dashboard

### GET `/api/dashboard/patient`

Get patient dashboard data including stats, recent activities, and activity counts.

**Authorization:** Required (Patient role only)

**Response:**

```json
{
  "success": true,
  "message": "Patient dashboard data retrieved successfully",
  "data": {
    "stats": {
      "upcomingAppointments": 3,
      "medicalRecords": 12,
      "activePrescriptions": 5,
      "healthScore": 85
    },
    "recentActivities": [
      {
        "type": "login",
        "description": "User logged in successfully",
        "date": "2024-01-15T10:30:00.000Z"
      }
    ],
    "lastLogin": "2024-01-15T10:30:00.000Z",
    "activityCounts": {
      "login": 5,
      "profile_update": 2
    }
  }
}
```

---

## Doctor Dashboard

### GET `/api/dashboard/doctor`

Get doctor dashboard data including patient list, patient activities, and statistics.

**Authorization:** Required (Doctor role only)

**Response:**

```json
{
  "success": true,
  "message": "Doctor dashboard data retrieved successfully",
  "data": {
    "stats": {
      "totalPatients": 25,
      "activePatients": 18,
      "upcomingAppointments": 8,
      "pendingReviews": 8
    },
    "patients": [
      {
        "id": "patient_id",
        "firstname": "John",
        "lastname": "Doe",
        "email": "john.doe@example.com",
        "age": 35,
        "gender": "male",
        "lastLogin": "2024-01-15T10:30:00.000Z",
        "lastActivity": "2024-01-15T10:30:00.000Z",
        "activityCount": 15,
        "status": "active"
      }
    ],
    "recentActivities": [
      {
        "patientId": "patient_id",
        "patientName": "John Doe",
        "type": "login",
        "description": "User logged in successfully",
        "date": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

## Admin Dashboard

### GET `/api/dashboard/admin`

Get admin dashboard data including user statistics, recent registrations, and activity logs.

**Authorization:** Required (Admin role only)

**Response:**

```json
{
  "success": true,
  "message": "Admin dashboard data retrieved successfully",
  "data": {
    "stats": {
      "totalUsers": 50,
      "totalPatients": 35,
      "totalDoctors": 10,
      "totalActivities": 500
    },
    "recentRegistrations": [
      {
        "id": "user_id",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "patient",
        "registeredAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "recentActivities": [
      {
        "userId": "user_id",
        "userName": "John Doe",
        "userRole": "patient",
        "type": "login",
        "description": "User logged in successfully",
        "date": "2024-01-15T10:30:00.000Z"
      }
    ],
    "activitiesByType": [
      {
        "type": "login",
        "count": 200
      }
    ],
    "usersByRole": [
      {
        "role": "patient",
        "count": 35
      }
    ]
  }
}
```

---

## Activity Log APIs

### GET `/api/dashboard/activities/me`

Get activity logs for the current authenticated user.

**Authorization:** Required

**Query Parameters:**

- `limit` (optional): Number of activities to return (default: 50)
- `page` (optional): Page number (default: 1)

**Response:**

```json
{
  "success": true,
  "message": "Activities retrieved successfully",
  "data": {
    "activities": [
      {
        "id": "activity_id",
        "type": "login",
        "description": "User logged in successfully",
        "date": "2024-01-15T10:30:00.000Z",
        "metadata": {}
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 50,
      "totalPages": 1
    }
  }
}
```

---

### GET `/api/dashboard/activities/patient/:patientId`

Get activity logs for a specific patient (Doctor access only).

**Authorization:** Required (Doctor role only)

**URL Parameters:**

- `patientId`: The ID of the patient

**Response:**

```json
{
  "success": true,
  "message": "Patient activities retrieved successfully",
  "data": {
    "activities": [
      {
        "id": "activity_id",
        "type": "login",
        "description": "User logged in successfully",
        "date": "2024-01-15T10:30:00.000Z",
        "metadata": {},
        "ipAddress": "192.168.1.1"
      }
    ],
    "total": 15
  }
}
```

---

## Activity Types

The following activity types are tracked:

- `login` - User logged in
- `logout` - User logged out
- `profile_update` - User updated their profile
- `appointment_created` - Appointment was created
- `appointment_updated` - Appointment was updated
- `prescription_added` - Prescription was added
- `record_viewed` - Medical record was viewed
- `other` - Other activities

---

## User Profile APIs

### Base URL

All user profile endpoints are prefixed with `/api/user`

### Authentication

All user profile endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

### GET `/api/user/profile`

Get current authenticated user's profile information.

**Authorization:** Required

**Response:**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "user_id",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john.doe@example.com",
      "DOB": "1995-05-20T00:00:00.000Z",
      "gender": "male",
      "role": "patient",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### PUT `/api/user/profile` or PATCH `/api/user/profile`

Update current authenticated user's profile information.

**Authorization:** Required

**Request Body:**
All fields are optional. Only include fields you want to update.

```json
{
  "firstname": "John",
  "lastname": "Doe",
  "DOB": "1995-05-20",
  "gender": "male",
  "password": "newpassword123",
  "currentPassword": "oldpassword123"
}
```

**Note:**

- To update password, both `password` and `currentPassword` must be provided
- `DOB` should be in ISO date format (YYYY-MM-DD)
- `gender` must be one of: `male`, `female`, `other`
- `firstname` and `lastname` must be between 2-50 characters
- `password` must be at least 6 characters long

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "user_id",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john.doe@example.com",
      "DOB": "1995-05-20T00:00:00.000Z",
      "gender": "male",
      "role": "patient",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "updatedFields": ["firstname", "lastname"]
  }
}
```

**Error Responses:**

### 400 Bad Request

```json
{
  "success": false,
  "message": "First name must be at least 2 characters long"
}
```

### 401 Unauthorized (for password update)

```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

**Note:** Profile updates are automatically logged as activities and will appear in activity logs.

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Only [role] can access [resource]"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```
