import { useEffect, useState } from "react";
import api from "../utils/api";
import PatientDashboard from "../components/dashboard/PatientDashboard";
import DoctorDashboard from "../components/dashboard/DoctorDashboard";

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = api.auth.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Show loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Render role-based dashboard
  if (user.role === "doctor") {
    return <DoctorDashboard user={user} />;
  }

  // Default to patient dashboard
  return <PatientDashboard user={user} />;
};

export default Dashboard;
