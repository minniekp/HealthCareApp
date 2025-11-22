import { useEffect, useState } from "react";
import api from "../utils/api";
import PatientDashboard from "../components/dashboard/PatientDashboard";
import DoctorDashboard from "../components/dashboard/DoctorDashboard";
import AdminDashboard from "../components/dashboard/AdminDashboard";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const currentUser = api.auth.getCurrentUser();
      
      if (!currentUser) {
        setError("User not found. Please login again.");
        setLoading(false);
        return;
      }

      setUser(currentUser);

      // Fetch dashboard data based on user role
      let data;
      if (currentUser.role === "doctor") {
        const response = await api.dashboard.getDoctorDashboard();
        data = response.data;
      } else if (currentUser.role === "admin") {
        const response = await api.dashboard.getAdminDashboard();
        data = response.data;
      } else {
        // Patient dashboard
        const response = await api.dashboard.getPatientDashboard();
        data = response.data;
      }

      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render role-based dashboard
  if (!user || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  if (user.role === "doctor") {
    return <DoctorDashboard user={user} data={dashboardData} />;
  }

  if (user.role === "admin") {
    return <AdminDashboard user={user} data={dashboardData} onDataUpdate={loadDashboard} />;
  }

  // Default to patient dashboard
  return <PatientDashboard user={user} data={dashboardData} />;
};

export default Dashboard;
