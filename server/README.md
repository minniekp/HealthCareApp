# Healthcare App - Backend Server

Express.js backend server with TypeScript, MongoDB, and JWT authentication.

**Squad 4**

**Team Members:**
- Vaishnav V
- Aashiq Ali

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Yarn or npm

### Installation

```bash
cd server
yarn install
# or
npm install
```

### Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/healthcare
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthcare

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# JWT Refresh Token
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
JWT_REFRESH_EXPIRE=30d

# CORS Configuration
CLIENT_URL=http://localhost:3000

# API Configuration
API_PREFIX=/api
```

### Running the Server

**Development mode:**
```bash
yarn dev
# or
npm run dev
```

**Production mode:**
```bash
yarn build
yarn start
# or
npm run build
npm start
```

The server will run at `http://localhost:5000`

## 📁 Project Structure

```
server/
├── src/
│   ├── config/           # Configuration files
│   │   └── database.ts   # MongoDB connection
│   ├── controllers/      # Route controllers
│   │   ├── authController.ts
│   │   ├── dashboardController.ts
│   │   ├── userController.ts
│   │   ├── healthController.ts
│   │   └── activityController.ts
│   ├── models/           # Mongoose models
│   │   ├── User.ts
│   │   ├── Activity.ts
│   │   └── HealthData.ts
│   ├── routes/           # Express routes
│   │   ├── authRoutes.ts
│   │   ├── dashboardRoutes.ts
│   │   ├── userRoutes.ts
│   │   └── healthRoutes.ts
│   ├── middleware/       # Express middleware
│   │   └── auth.ts       # JWT authentication
│   ├── utils/            # Utility functions
│   │   ├── jwt.ts        # JWT helpers
│   │   └── activityLogger.ts
│   ├── scripts/          # Database seed scripts
│   │   ├── seedUsers.ts
│   │   ├── seedActivities.ts
│   │   └── seedHealthData.ts
│   └── index.ts          # Entry point
├── dist/                 # Compiled JavaScript
└── package.json
```

## 🗄️ Database Models

### User Model
- `firstname`, `lastname`, `email`
- `password` (hashed)
- `DOB`, `gender`
- `role` (patient, doctor, admin)
- `status` (active, inactive)
- `refreshToken`
- Timestamps

### Activity Model
- `userId` (reference to User)
- `userRole`
- `activityType` (login, logout, profile_update, etc.)
- `description`
- `metadata`
- `ipAddress`, `userAgent`
- Timestamps

### HealthData Model
- `userId` (reference to User)
- `date`
- `steps`
- `waterIntake` (ml)
- `sleepHours`
- Timestamps

## 🔌 API Endpoints

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

#### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
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

#### Logout
- **POST** `/api/auth/logout`
- **Headers:** `Authorization: Bearer <access_token>`

### Dashboard Routes (`/api/dashboard`)

#### Get Patient Dashboard
- **GET** `/api/dashboard/patient`
- **Headers:** `Authorization: Bearer <access_token>`
- **Access:** Patients only

#### Get Doctor Dashboard
- **GET** `/api/dashboard/doctor`
- **Headers:** `Authorization: Bearer <access_token>`
- **Access:** Doctors only

#### Get Admin Dashboard
- **GET** `/api/dashboard/admin`
- **Headers:** `Authorization: Bearer <access_token>`
- **Access:** Admins only

#### Get Activities
- **GET** `/api/dashboard/activities/me?limit=10&page=1`
- **GET** `/api/dashboard/activities/patient/:patientId?limit=10&page=1`
- **Headers:** `Authorization: Bearer <access_token>`

### User Routes (`/api/user`)

#### Get Profile
- **GET** `/api/user/profile`
- **Headers:** `Authorization: Bearer <access_token>`

#### Update Profile
- **PUT/PATCH** `/api/user/profile`
- **Headers:** `Authorization: Bearer <access_token>`
- **Body:**
  ```json
  {
    "firstname": "John",
    "lastname": "Doe",
    "DOB": "1990-01-01",
    "gender": "male",
    "password": "newpassword",
    "currentPassword": "oldpassword"
  }
  ```

#### Get User by ID
- **GET** `/api/user/:userId`
- **Headers:** `Authorization: Bearer <access_token>`
- **Access:** Doctors and Admins

#### Update User Role
- **PATCH** `/api/user/:userId/role`
- **Headers:** `Authorization: Bearer <access_token>`
- **Body:** `{ "role": "doctor" }`
- **Access:** Doctors and Admins

#### Update User Status
- **PATCH** `/api/user/:userId/status`
- **Headers:** `Authorization: Bearer <access_token>`
- **Body:** `{ "status": "active" }`
- **Access:** Admins only

### Health Routes (`/api/health`)

#### Get Health Data
- **GET** `/api/health?days=30`
- **GET** `/api/health/patient/:patientId?days=30`
- **Headers:** `Authorization: Bearer <access_token>`
- **Query:** `days` (1-365, default: 30)

#### Create/Update Health Data
- **POST/PUT** `/api/health`
- **Headers:** `Authorization: Bearer <access_token>`
- **Body:**
  ```json
  {
    "date": "2024-01-15",
    "steps": 8500,
    "waterIntake": 2000,
    "sleepHours": 7.5
  }
  ```

## 🔐 Authentication

All protected routes require an `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Token Flow
1. User logs in → receives `accessToken` (7 days) and `refreshToken` (30 days)
2. Access token used for API requests
3. On token expiry → use refresh token to get new access token
4. On logout → refresh token invalidated

## 🎭 Role-Based Access Control

### Patient
- Access own dashboard
- View own health data
- Update own profile
- View own activities

### Doctor
- Access doctor dashboard
- View patient health data
- View patient activities
- Change patient role to doctor
- View patient details

### Admin
- Access admin dashboard
- View all users
- Change user roles (including admin)
- Change user status
- View all activities
- System-wide statistics

## 📊 Database Seeding

### Seed Users
```bash
yarn seed
```
Creates default users:
- Admin: `admin@hcl.com` / `admin123`
- Doctors: `doctor@hcl.com` / `doctor123`
- Patients: Multiple test patients

### Seed Activities
```bash
yarn seed:activities
```
Creates activity logs for all users (last 90 days).

### Seed Health Data
```bash
yarn seed:health
```
Creates health data for all patients (last 30 days).

## 🛠️ Available Scripts

### `yarn dev`
Run server in development mode with hot reload.

### `yarn build`
Compile TypeScript to JavaScript in `dist/` folder.

### `yarn start`
Run production server (requires build first).

### `yarn lint`
Type check TypeScript files.

### `yarn format`
Format code with Prettier.

### `yarn format:check`
Check code formatting without making changes.

### `yarn seed`
Seed database with users.

### `yarn seed:activities`
Seed database with activities.

### `yarn seed:health`
Seed database with health data.

## 🔒 Security Features

- Password hashing with bcrypt (salt rounds: 10)
- JWT token authentication
- Refresh token rotation
- CORS configuration
- Input validation
- Role-based access control
- Activity logging

## 📝 Code Quality

- TypeScript for type safety
- ESLint for linting
- Prettier for formatting
- Consistent code style
- Error handling
- Input validation

## 🐛 Error Handling

All errors return consistent JSON format:

```json
{
  "success": false,
  "message": "Error message"
}
```

Success responses:

```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

## 📄 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API documentation.

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use strong JWT secrets
3. Configure MongoDB connection
4. Set proper CORS origins
5. Build the project: `yarn build`
6. Start the server: `yarn start`

## 📦 Dependencies

### Core
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT handling
- `bcryptjs` - Password hashing
- `cors` - CORS middleware
- `dotenv` - Environment variables

### Development
- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution
- `ts-node-dev` - Development server
- `prettier` - Code formatting

## 📄 License

ISC

---

**Squad 4**

**Team Members:**
- Vaishnav V
- Aashiq Ali

For frontend documentation, see [../client/README.md](../client/README.md)
