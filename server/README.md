# Healthcare App - Backend Server

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
# or
yarn install
```

### 2. Environment Variables

Create a `.env` file in the `server` directory (copy from `.env copy`):

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection
MONGODB_URI=your_mongodb_connection_string

# JWT Secret - Change this in production!
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# JWT Refresh Token Secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRE=30d

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# API Configuration
API_PREFIX=/api
```

### 3. Run the Server

Development mode:

```bash
npm run dev
# or
yarn dev
```

Production mode:

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Register

- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "DOB": "1990-01-01",
    "gender": "male"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": { ... },
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
  ```

#### Login

- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": { ... },
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
  ```

#### Refresh Token

- **POST** `/api/auth/refresh-token`
- **Body:**
  ```json
  {
    "refreshToken": "your_refresh_token"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Token refreshed successfully",
    "data": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
  ```

#### Logout

- **POST** `/api/auth/logout`
- **Headers:** `Authorization: Bearer <access_token>`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Logout successful"
  }
  ```

## Protected Routes

To access protected routes, include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Features

- ✅ JWT Authentication
- ✅ Refresh Token Support
- ✅ Password Hashing (bcrypt)
- ✅ MongoDB Integration
- ✅ TypeScript Support
- ✅ CORS Configuration
- ✅ Error Handling
