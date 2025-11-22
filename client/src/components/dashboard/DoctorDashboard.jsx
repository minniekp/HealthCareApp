import { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  Stethoscope,
  Search,
  Filter,
  UserCircle,
  Mail,
  Clock,
  Activity,
  User,
  Heart,
  AlertTriangle,
  Footprints,
  Droplet,
  Moon,
} from "lucide-react";
import {
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Modal from "../Modal";
import api from "../../utils/api";

const DoctorDashboard = ({ user, data }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientDetails, setPatientDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [healthData7Days, setHealthData7Days] = useState(null);
  const [healthData30Days, setHealthData30Days] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("7days");

  // Use real data from API or fallback to empty array
  const allocatedPatients = data?.patients?.map((patient) => ({
    id: patient.id,
    firstname: patient.firstname,
    lastname: patient.lastname,
    email: patient.email,
    age: patient.age,
    gender: patient.gender,
    lastAppointment: patient.lastActivity,
    nextAppointment: null, // This would come from appointments API
    status: patient.status,
    condition: "General Checkup", // This would come from medical records
    lastLogin: patient.lastLogin,
  })) || [];

  const stats = [
    {
      title: "Total Patients",
      value: data?.stats?.totalPatients?.toString() || "0",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Active Patients",
      value: data?.stats?.activePatients?.toString() || "0",
      icon: UserCircle,
      color: "bg-green-500",
    },
    {
      title: "Upcoming Appointments",
      value: data?.stats?.upcomingAppointments?.toString() || "0",
      icon: Calendar,
      color: "bg-purple-500",
    },
    {
      title: "Pending Reviews",
      value: data?.stats?.pendingReviews?.toString() || "0",
      icon: Stethoscope,
      color: "bg-orange-500",
    },
  ];

  // Filter patients based on search and status
  const filteredPatients = allocatedPatients.filter((patient) => {
    const matchesSearch =
      patient.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus =
      filterStatus === "all" || patient.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const formatShortDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLongDate = (dateString) => {
    if (!dateString) return "Not provided";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAge = (dateString) => {
    if (!dateString) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatGender = (gender) => {
    if (!gender) return "Not provided";
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  const handleViewDetails = async (patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
    setIsLoadingDetails(true);
    setLoadingHealth(true);
    setHealthData7Days(null);
    setHealthData30Days(null);

    try {
      const [userResponse, health7Days, health30Days] = await Promise.all([
        api.user.getUserById(patient.id),
        api.health.getHealthData(patient.id, 7).catch(() => ({ success: false })),
        api.health.getHealthData(patient.id, 30).catch(() => ({ success: false })),
      ]);

      if (userResponse.success && userResponse.data.user) {
        setPatientDetails(userResponse.data.user);
      } else {
        setError("Failed to load patient details");
      }

      if (health7Days.success) {
        setHealthData7Days(health7Days.data);
      }
      if (health30Days.success) {
        setHealthData30Days(health30Days.data);
      }
    } catch (err) {
      console.error("Error loading patient details:", err);
      setError(err.message || "Failed to load patient details");
    } finally {
      setIsLoadingDetails(false);
      setLoadingHealth(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedPatient || !patientDetails) return;

    setError(null);
    setSuccess(null);
    setIsUpdatingRole(true);

    try {
      const response = await api.user.updateUserRole(selectedPatient.id, "doctor");
      if (response.success) {
        setSuccess(`Successfully changed ${patientDetails.firstname} ${patientDetails.lastname} to doctor role`);
        // Update patient details
        setPatientDetails((prev) => ({
          ...prev,
          role: "doctor",
        }));
        // Refresh dashboard data after a delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(response.message || "Failed to update role");
      }
    } catch (err) {
      console.error("Error updating role:", err);
      setError(err.message || "Failed to update role");
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
    setPatientDetails(null);
    setError(null);
    setSuccess(null);
    setHealthData7Days(null);
    setHealthData30Days(null);
    setSelectedPeriod("7days");
  };

  // Get current health data based on selected period
  const currentHealthData = selectedPeriod === "7days" ? healthData7Days : healthData30Days;

  // Format date for chart
  const formatChartDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Prepare chart data
  const chartData = currentHealthData?.healthData?.map((data) => ({
    date: formatChartDate(data.date),
    fullDate: new Date(data.date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    }),
    steps: data.steps || 0,
    waterIntake: data.waterIntake || 0,
    sleepHours: data.sleepHours || 0,
  })) || [];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2 text-sm">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span>{" "}
              {entry.name === "Steps"
                ? entry.value.toLocaleString()
                : entry.name === "Water Intake"
                ? `${entry.value} ml`
                : `${entry.value} hrs`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-primary rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome, Dr. {user?.firstname || user?.lastname || "Doctor"}!
        </h1>
        <p className="text-white/90">
          Manage your patients and appointments
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Patients List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Users className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-gray-900">
              Allocated Patients
            </h2>
            <span className="px-2 py-1 bg-primary-light text-primary rounded-full text-sm font-medium">
              {filteredPatients.length}
            </span>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Appointment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No patients found
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold mr-3">
                          {patient.firstname[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {patient.firstname} {patient.lastname}
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        {patient.condition}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {patient.lastLogin ? formatDateTime(patient.lastLogin) : "Never"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {patient.nextAppointment ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={16} className="text-primary" />
                          {formatShortDate(patient.nextAppointment)}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not scheduled</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          patient.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {patient.status.charAt(0).toUpperCase() +
                          patient.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewDetails(patient)}
                        className="text-primary hover:text-primary-dark font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Patient Activities */}
      {data?.recentActivities && data.recentActivities.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Recent Patient Activities</h2>
          </div>
          <div className="space-y-3">
            {data.recentActivities.slice(0, 10).map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="p-2 bg-primary-light rounded-lg">
                  <UserCircle className="text-primary" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {activity.patientName}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(activity.date)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 bg-primary-light hover:bg-primary rounded-lg transition-colors text-left group">
            <Users className="text-primary group-hover:text-white transition-colors" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-white transition-colors">Add Patient</h3>
              <p className="text-sm text-gray-600 group-hover:text-white/80 transition-colors">Allocate new patient</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-primary-light hover:bg-primary rounded-lg transition-colors text-left group">
            <Calendar className="text-primary group-hover:text-white transition-colors" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-white transition-colors">Schedule Appointment</h3>
              <p className="text-sm text-gray-600 group-hover:text-white/80 transition-colors">Book patient visit</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-primary-light hover:bg-primary rounded-lg transition-colors text-left group">
            <Stethoscope className="text-primary group-hover:text-white transition-colors" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-white transition-colors">Medical Records</h3>
              <p className="text-sm text-gray-600 group-hover:text-white/80 transition-colors">View patient history</p>
            </div>
          </button>
        </div>
      </div>

      {/* Patient Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={patientDetails ? `${patientDetails.firstname} ${patientDetails.lastname} - Details` : "Patient Details"}
        size="lg"
      >
        {isLoadingDetails ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <div className="text-gray-500">Loading patient details...</div>
            </div>
          </div>
        ) : patientDetails ? (
          <div className="space-y-6">
            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}

            {/* Patient Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {patientDetails.firstname?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {patientDetails.firstname} {patientDetails.lastname}
                </h3>
                <p className="text-gray-600 capitalize">{patientDetails.role}</p>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="text-primary" size={20} />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">First Name</label>
                  <p className="text-gray-900 font-medium">{patientDetails.firstname}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Last Name</label>
                  <p className="text-gray-900 font-medium">{patientDetails.lastname}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    Email
                  </label>
                  <p className="text-gray-900 font-medium">{patientDetails.email}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    Date of Birth
                  </label>
                  <p className="text-gray-900 font-medium">{formatLongDate(patientDetails.DOB)}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Age</label>
                  <p className="text-gray-900 font-medium">{getAge(patientDetails.DOB)} years old</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Heart size={16} className="text-gray-400" />
                    Gender
                  </label>
                  <p className="text-gray-900 font-medium">{formatGender(patientDetails.gender)}</p>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserCircle className="text-primary" size={20} />
                Account Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">User ID</label>
                  <p className="text-gray-900 font-mono text-sm">{patientDetails.id}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Current Role</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    patientDetails.role === "doctor"
                      ? "bg-blue-100 text-blue-800"
                      : patientDetails.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {patientDetails.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Health Metrics Section */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Heart className="text-primary" size={20} />
                  <h4 className="text-lg font-semibold text-gray-900">Health Metrics</h4>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPeriod("7days")}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selectedPeriod === "7days"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setSelectedPeriod("30days")}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selectedPeriod === "30days"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    30 Days
                  </button>
                </div>
              </div>

              {loadingHealth ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <div className="text-gray-500 text-sm">Loading health data...</div>
                  </div>
                </div>
              ) : currentHealthData?.healthData?.length > 0 ? (
                <div className="space-y-6">
                  {/* Statistics Summary */}
                  {currentHealthData.statistics && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="bg-blue-500 p-1.5 rounded">
                            <Footprints className="text-white" size={14} />
                          </div>
                          <span className="text-xs font-medium text-blue-900">Avg Steps</span>
                        </div>
                        <p className="text-lg font-bold text-blue-900 mt-1">
                          {currentHealthData.statistics.avgSteps.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-3 border border-cyan-200">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="bg-cyan-500 p-1.5 rounded">
                            <Droplet className="text-white" size={14} />
                          </div>
                          <span className="text-xs font-medium text-cyan-900">Avg Water</span>
                        </div>
                        <p className="text-lg font-bold text-cyan-900 mt-1">
                          {currentHealthData.statistics.avgWater} ml
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="bg-indigo-500 p-1.5 rounded">
                            <Moon className="text-white" size={14} />
                          </div>
                          <span className="text-xs font-medium text-indigo-900">Avg Sleep</span>
                        </div>
                        <p className="text-lg font-bold text-indigo-900 mt-1">
                          {currentHealthData.statistics.avgSleep} hrs
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Steps and Sleep Combined Chart */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-blue-500 p-1.5 rounded">
                        <Footprints className="text-white" size={16} />
                      </div>
                      <h5 className="text-sm font-semibold text-gray-900">Daily Steps & Sleep Hours</h5>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <ComposedChart
                        data={chartData}
                        margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis
                          dataKey="date"
                          stroke="#6b7280"
                          style={{ fontSize: "10px", fontWeight: 500 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tick={{ fill: "#6b7280" }}
                        />
                        <YAxis
                          yAxisId="left"
                          label={{ 
                            value: "Steps", 
                            angle: -90, 
                            position: "insideLeft", 
                            style: { fontSize: "10px", fill: "#3b82f6", fontWeight: 600 } 
                          }}
                          stroke="#3b82f6"
                          style={{ fontSize: "10px" }}
                          tick={{ fill: "#3b82f6" }}
                          tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString()}
                          domain={[0, 'dataMax']}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          label={{ 
                            value: "Sleep Hours", 
                            angle: 90, 
                            position: "insideRight", 
                            style: { fontSize: "10px", fill: "#6366f1", fontWeight: 600 } 
                          }}
                          stroke="#6366f1"
                          style={{ fontSize: "10px" }}
                          tick={{ fill: "#6366f1" }}
                          domain={[0, 12]}
                        />
                        <Tooltip 
                          content={<CustomTooltip />}
                          cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: "15px", fontSize: "11px" }}
                          iconType="circle"
                          align="center"
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="steps"
                          name="Steps"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                          opacity={0.9}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="sleepHours"
                          name="Sleep Hours"
                          stroke="#6366f1"
                          strokeWidth={2.5}
                          dot={{ fill: "#6366f1", r: 4, strokeWidth: 2, stroke: "#fff" }}
                          activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Water Intake Chart */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-cyan-500 p-1.5 rounded">
                        <Droplet className="text-white" size={16} />
                      </div>
                      <h5 className="text-sm font-semibold text-gray-900">Water Intake (ml)</h5>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis
                          dataKey="date"
                          stroke="#6b7280"
                          style={{ fontSize: "10px", fontWeight: 500 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tick={{ fill: "#6b7280" }}
                        />
                        <YAxis
                          label={{ 
                            value: "Water Intake (ml)", 
                            angle: -90, 
                            position: "insideLeft", 
                            style: { fontSize: "10px", fill: "#06b6d4", fontWeight: 600 } 
                          }}
                          stroke="#06b6d4"
                          style={{ fontSize: "10px" }}
                          tick={{ fill: "#06b6d4" }}
                          tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}L` : `${value}ml`}
                          domain={[0, 'dataMax']}
                        />
                        <Tooltip 
                          content={<CustomTooltip />}
                          cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: "15px", fontSize: "11px" }}
                          iconType="circle"
                          align="center"
                        />
                        <Bar
                          dataKey="waterIntake"
                          name="Water Intake"
                          fill="#06b6d4"
                          radius={[4, 4, 0, 0]}
                          opacity={0.9}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  <Heart className="text-gray-400 mx-auto mb-2" size={24} />
                  <p>No health data available for this period</p>
                </div>
              )}
            </div>

            {/* Role Change Section */}
            {patientDetails.role === "patient" && (
              <div className="border-t border-gray-200 pt-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
                    <div>
                      <h5 className="font-semibold text-yellow-900 mb-1">Change User Role</h5>
                      <p className="text-sm text-yellow-800">
                        You can promote this patient to a doctor role. This action will give them doctor privileges.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleChangeRole}
                  disabled={isUpdatingRole}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingRole ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating Role...
                    </>
                  ) : (
                    <>
                      <Stethoscope size={18} />
                      Change to Doctor Role
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No patient details available
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorDashboard;

