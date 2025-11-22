# Healthcare App

A full-stack healthcare management application with role-based access control, health metrics tracking, and comprehensive activity logging.

## 🏥 Features

### Authentication & Authorization
- ✅ JWT-based authentication with refresh tokens
- ✅ Role-based access control (Patient, Doctor, Admin)
- ✅ Secure password hashing with bcrypt
- ✅ Protected routes and middleware
- ✅ Session management

### User Management
- ✅ User registration and login
- ✅ Profile management with edit functionality
- ✅ Role management (Admin can change user roles)
- ✅ User status management (Active/Inactive)
- ✅ User search and filtering

### Health Metrics Tracking
- ✅ Daily steps tracking
- ✅ Water intake monitoring
- ✅ Sleep hours logging
- ✅ 7-day and 30-day views
- ✅ Interactive charts and visualizations
- ✅ Statistics and averages

### Activity Logging
- ✅ Comprehensive activity tracking
- ✅ Login/logout logging
- ✅ Profile update tracking
- ✅ Role change logging
- ✅ Activity history for patients and doctors

### Dashboards
- ✅ **Patient Dashboard**: Health metrics, appointments, medical records
- ✅ **Doctor Dashboard**: Patient list, health data, activity monitoring
- ✅ **Admin Dashboard**: System overview, user management, statistics

### UI/UX
- ✅ Modern, responsive design with Tailwind CSS
- ✅ Professional charts using Recharts
- ✅ Interactive modals and forms
- ✅ Real-time data updates
- ✅ Healthcare-themed color scheme

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **React Router DOM** - Routing
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcryptjs** - Password hashing

## 📁 Project Structure

```
HealthCareApp/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── layouts/        # Layout components
│   │   ├── utils/          # Utility functions
│   │   ├── stores/         # State management
│   │   └── middleware/     # Auth middleware
│   └── package.json
├── server/                 # Express backend application
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   └── scripts/        # Seed scripts
│   └── package.json
└── package.json           # Root package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Yarn or npm
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HealthCareApp
   ```

2. **Install all dependencies**
   ```bash
   yarn install:all
   # or
   npm run install:all
   ```

3. **Set up environment variables**

   Create `.env` file in `server/` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   JWT_REFRESH_SECRET=your_refresh_token_secret
   JWT_REFRESH_EXPIRE=30d
   CLIENT_URL=http://localhost:3000
   API_PREFIX=/api
   ```

4. **Seed the database** (optional)
   ```bash
   cd server
   yarn seed              # Seed users
   yarn seed:activities   # Seed activities
   yarn seed:health       # Seed health data
   ```

5. **Run the application**

   Development (both client and server):
   ```bash
   yarn dev
   ```

   Or run separately:
   ```bash
   # Terminal 1 - Server
   yarn server
   
   # Terminal 2 - Client
   yarn client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 👥 Default Users

After seeding, you can login with:

- **Admin**: `admin@hcl.com` / `admin123`
- **Doctor**: `doctor@hcl.com` / `doctor123`
- **Patient**: `patient@hcl.com` / `patient123`

## 📚 Available Scripts

### Root Level
- `yarn dev` - Run both client and server in development mode
- `yarn server` - Run only the server
- `yarn client` - Run only the client
- `yarn install:all` - Install dependencies for all projects
- `yarn build` - Build server for production
- `yarn build:client` - Build client for production

### Server Scripts
- `yarn dev` - Run server in development mode
- `yarn build` - Build TypeScript to JavaScript
- `yarn start` - Run production server
- `yarn lint` - Type check TypeScript
- `yarn format` - Format code with Prettier
- `yarn seed` - Seed users
- `yarn seed:activities` - Seed activities
- `yarn seed:health` - Seed health data

### Client Scripts
- `yarn start` or `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn test` - Run tests

## 🔐 Authentication Flow

1. User registers/logs in
2. Server returns `accessToken` and `refreshToken`
3. Client stores tokens in localStorage
4. Access token is included in API requests
5. On token expiry, refresh token is used to get new access token
6. On logout, tokens are cleared

## 🎭 User Roles

### Patient
- View personal health metrics
- Track daily steps, water intake, and sleep
- View appointments and medical records
- Edit own profile

### Doctor
- View allocated patients
- Access patient health data
- View patient activity logs
- Promote patients to doctor role
- View patient details

### Admin
- Manage all users
- Change user roles and status
- View system-wide statistics
- Access all user data
- Monitor system activities

## 📊 API Documentation

See [server/API_DOCUMENTATION.md](./server/API_DOCUMENTATION.md) for complete API documentation.

### Main Endpoints
- `/api/auth/*` - Authentication routes
- `/api/dashboard/*` - Dashboard data
- `/api/user/*` - User management
- `/api/health/*` - Health metrics

## 🗄️ Database Models

- **User**: User accounts with roles and profile information
- **Activity**: Activity logs for all user actions
- **HealthData**: Daily health metrics (steps, water, sleep)

## 🎨 UI Features

- Responsive design for all screen sizes
- Interactive charts with Recharts
- Modal dialogs for detailed views
- Real-time data updates
- Loading states and error handling
- Toast notifications
- Search and filter functionality

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Refresh token rotation
- CORS configuration
- Protected API routes
- Input validation
- Role-based access control

## 📝 Development

### Code Style
- TypeScript for backend
- ESLint for linting
- Prettier for formatting
- Consistent naming conventions

### Best Practices
- Component-based architecture
- Reusable utility functions
- Error handling
- Loading states
- Responsive design

## 🚢 Deployment

### Production Build

1. **Build the client**
   ```bash
   cd client
   yarn build
   ```

2. **Build the server**
   ```bash
   cd server
   yarn build
   ```

3. **Set production environment variables**

4. **Start the server**
   ```bash
   cd server
   yarn start
   ```

## 📄 License

ISC

## 👨‍💻 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions, please open an issue in the repository.

---

Built with ❤️ for healthcare management
