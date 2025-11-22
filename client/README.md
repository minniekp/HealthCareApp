# Healthcare App - Frontend

React-based frontend application for the Healthcare Management System.

**Squad 4**

**Team Members:**

- Vaishnav V
- Aashiq Ali

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Yarn or npm

### Installation

```bash
cd client
yarn install
# or
npm install
```

### Environment Setup

The frontend connects to the backend API. Make sure the backend server is running and the API URL is configured in `src/utils/api.js`.

Default API URL: `http://localhost:5000/api`

### Running the Application

```bash
yarn start
# or
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
client/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable components
│   │   ├── common/      # Common UI components
│   │   ├── dashboard/   # Dashboard components
│   │   └── Modal.jsx    # Modal component
│   ├── pages/           # Page components
│   │   ├── auth/        # Authentication pages
│   │   ├── Dashboard.jsx
│   │   └── Profile.jsx
│   ├── layouts/         # Layout components
│   │   ├── AuthLayout.jsx
│   │   └── MainLayout.jsx
│   ├── utils/           # Utility functions
│   │   └── api.js       # API service
│   ├── stores/          # State management
│   │   └── authStore.js
│   ├── middleware/      # Auth middleware
│   │   └── auth.js
│   ├── hooks/           # Custom hooks
│   │   └── useRole.js
│   └── App.js           # Main app component
└── package.json
```

## 🎨 Technologies

- **React 19** - UI library
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Charting library for data visualization
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications

## 🎯 Features

### Authentication

- User login and registration
- JWT token management
- Automatic token refresh
- Protected routes
- Session persistence

### Dashboards

#### Patient Dashboard

- Health metrics visualization
- Daily steps, water intake, and sleep tracking
- 7-day and 30-day views
- Interactive charts with Recharts
- Recent activities
- Quick actions

#### Doctor Dashboard

- Patient list with search and filters
- Patient health data viewing
- Activity monitoring
- Role management
- Patient details modal with charts

#### Admin Dashboard

- System-wide statistics
- User management
- Role and status updates
- User search and filtering
- Comprehensive user details

### Profile Management

- View profile information
- Edit profile with modal form
- Password change functionality
- Form validation
- Real-time updates

## 📊 Charts & Visualizations

The application uses **Recharts** for professional data visualization:

- **Composed Charts**: Dual-axis charts (bars + line)
- **Bar Charts**: Single metric visualization
- **Interactive Tooltips**: Hover to see detailed values
- **Responsive Design**: Charts adapt to container size
- **Custom Styling**: Healthcare-themed colors

### Chart Features

- Steps tracking with bar charts
- Sleep hours with line charts
- Water intake visualization
- Combined metrics on dual-axis
- 7-day and 30-day period views

## 🔐 Authentication Flow

1. User logs in → receives access and refresh tokens
2. Tokens stored in localStorage
3. Access token included in API requests
4. On 401 error → refresh token used to get new access token
5. On logout → tokens cleared

## 🛣️ Routing

- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Role-based dashboard
- `/profile` - User profile page

Routes are protected using `ProtectedRoute` component.

## 🎨 Styling

### Tailwind CSS Configuration

- Custom color scheme (primary, secondary)
- Healthcare-themed colors
- Responsive breakpoints
- Custom utilities

### Color Scheme

- Primary: Purple/Blue (HCL theme)
- Success: Green
- Warning: Yellow
- Error: Red
- Info: Blue/Cyan

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Responsive charts
- Adaptive layouts
- Touch-friendly interactions

## 🔧 Available Scripts

### `yarn start` or `yarn dev`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `yarn build`

Builds the app for production to the `build` folder.

### `yarn test`

Launches the test runner in interactive watch mode.

## 📦 Key Dependencies

```json
{
  "react": "^19.2.0",
  "react-router-dom": "^6.21.1",
  "tailwindcss": "^3.4.0",
  "recharts": "^3.4.1",
  "lucide-react": "^0.344.0",
  "react-hot-toast": "^2.4.1"
}
```

## 🎯 Component Architecture

### Layout Components

- `AuthLayout` - Layout for authentication pages
- `MainLayout` - Main app layout with sidebar and header

### Page Components

- `Login` - User login form
- `Register` - User registration form
- `Dashboard` - Role-based dashboard router
- `Profile` - User profile page

### Dashboard Components

- `PatientDashboard` - Patient-specific dashboard
- `DoctorDashboard` - Doctor-specific dashboard
- `AdminDashboard` - Admin-specific dashboard

### Common Components

- `Modal` - Reusable modal dialog
- `InputField` - Form input component
- `ProtectedRoute` - Route protection wrapper

## 🔌 API Integration

API calls are handled through `src/utils/api.js`:

```javascript
import api from "./utils/api";

// Authentication
await api.auth.login(email, password);
await api.auth.register(userData);

// Dashboard
await api.dashboard.getPatientDashboard();
await api.dashboard.getDoctorDashboard();
await api.dashboard.getAdminDashboard();

// User Management
await api.user.getProfile();
await api.user.updateProfile(data);
await api.user.updateUserRole(userId, role);

// Health Data
await api.health.getHealthData(patientId, days);
await api.health.upsertHealthData(date, steps, water, sleep);
```

## 🎨 UI Components

### Charts

- Professional Recharts implementation
- Dual-axis support
- Custom tooltips
- Responsive containers
- Color-coded metrics

### Forms

- Input validation
- Error messages
- Loading states
- Success feedback

### Modals

- Reusable modal component
- Different sizes (sm, md, lg)
- Close on backdrop click
- Scrollable content

## 🐛 Error Handling

- API error handling
- Network error handling
- Form validation errors
- Toast notifications for errors
- Loading states

## 📝 Best Practices

- Component reusability
- Separation of concerns
- Error boundaries
- Loading states
- Responsive design
- Accessibility considerations

## 🚀 Production Build

```bash
yarn build
```

Creates an optimized production build in the `build` folder.

## 📄 License

ISC

---

**Squad 4**

**Team Members:**

- Vaishnav V
- Aashiq Ali

For backend documentation, see [../server/README.md](../server/README.md)
