import { useState, useEffect } from "react";
import {
  Calendar,
  Stethoscope,
  FileText,
  Activity,
  TrendingUp,
  Heart,
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
import api from "../../utils/api";

const PatientDashboard = ({ user, data }) => {
  const [healthData7Days, setHealthData7Days] = useState(null);
  const [healthData30Days, setHealthData30Days] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("7days"); // "7days" or "30days"
  // Use real data from API or fallback to defaults
  const stats = [
    {
      title: "Upcoming Appointments",
      value: data?.stats?.upcomingAppointments?.toString() || "0",
      icon: Calendar,
      color: "bg-blue-500",
    },
    {
      title: "Medical Records",
      value: data?.stats?.medicalRecords?.toString() || "0",
      icon: FileText,
      color: "bg-green-500",
    },
    {
      title: "Active Prescriptions",
      value: data?.stats?.activePrescriptions?.toString() || "0",
      icon: Stethoscope,
      color: "bg-purple-500",
    },
    {
      title: "Health Score",
      value: data?.stats?.healthScore ? `${data.stats.healthScore}%` : "N/A",
      icon: Activity,
      color: "bg-orange-500",
    },
  ];

  // Format activities from API
  const formatActivityDate = (dateString) => {
    if (!dateString) return { date: "N/A", time: "" };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getActivityType = (type) => {
    const typeMap = {
      login: "appointment",
      logout: "appointment",
      profile_update: "record",
      appointment_created: "appointment",
      appointment_updated: "appointment",
      prescription_added: "prescription",
      record_viewed: "record",
      other: "record",
    };
    return typeMap[type] || "record";
  };

  const getActivityTitle = (activity) => {
    const typeMap = {
      login: "Logged in",
      logout: "Logged out",
      profile_update: "Profile Updated",
      appointment_created: "Appointment Scheduled",
      appointment_updated: "Appointment Updated",
      prescription_added: "Prescription Added",
      record_viewed: "Medical Record Viewed",
      other: activity.description || "Activity",
    };
    return typeMap[activity.type] || activity.description || "Activity";
  };

  const recentActivities = data?.recentActivities?.map((activity) => {
    const { date, time } = formatActivityDate(activity.date);
    return {
      title: getActivityTitle(activity),
      date,
      time,
      type: getActivityType(activity.type),
    };
  }) || [];

  // Health chart data - generate from activity counts or use dummy data
  const generateHealthData = () => {
    if (data?.activityCounts) {
      // Use activity counts to generate a simple trend
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      const baseScore = data.stats?.healthScore || 80;
      return months.map((month, index) => ({
        month,
        value: Math.max(70, Math.min(100, baseScore + (Math.random() * 10 - 5))),
      }));
    }
    // Fallback dummy data
    return [
      { month: "Jan", value: 78 },
      { month: "Feb", value: 82 },
      { month: "Mar", value: 80 },
      { month: "Apr", value: 85 },
      { month: "May", value: 83 },
      { month: "Jun", value: 85 },
    ];
  };

  const healthData = generateHealthData();

  const maxValue = Math.max(...healthData.map((d) => d.value));

  // Fetch health data
  useEffect(() => {
    const loadHealthData = async () => {
      try {
        setLoadingHealth(true);
        const [data7Days, data30Days] = await Promise.all([
          api.health.getHealthData(null, 7),
          api.health.getHealthData(null, 30),
        ]);

        if (data7Days.success) {
          setHealthData7Days(data7Days.data);
        }
        if (data30Days.success) {
          setHealthData30Days(data30Days.data);
        }
      } catch (err) {
        console.error("Error loading health data:", err);
      } finally {
        setLoadingHealth(false);
      }
    };

    loadHealthData();
  }, []);

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
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
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
          Welcome back, {user?.firstname || "User"}!
        </h1>
        <p className="text-white/90">
          Here's an overview of your health information
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
                <TrendingUp className="text-gray-400" size={20} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Health Metrics Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Heart className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Health Metrics</h2>
              <p className="text-sm text-gray-500 mt-1">Track your daily health activities</p>
            </div>
          </div>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setSelectedPeriod("7days")}
              className={`px-5 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                selectedPeriod === "7days"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setSelectedPeriod("30days")}
              className={`px-5 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                selectedPeriod === "30days"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        {loadingHealth ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <div className="text-gray-500">Loading health data...</div>
            </div>
          </div>
        ) : currentHealthData?.healthData?.length > 0 ? (
          <div className="space-y-10">
            {/* Statistics Summary - Enhanced */}
            {currentHealthData.statistics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500 p-3 rounded-lg">
                        <Footprints className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-700">Avg Steps/Day</p>
                        <p className="text-3xl font-bold text-blue-900 mt-1">
                          {currentHealthData.statistics.avgSteps.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-blue-600 mt-2">
                    Total: {currentHealthData.statistics.totalSteps.toLocaleString()} steps
                  </div>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-6 border border-cyan-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-cyan-500 p-3 rounded-lg">
                        <Droplet className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-cyan-700">Avg Water/Day</p>
                        <p className="text-3xl font-bold text-cyan-900 mt-1">
                          {currentHealthData.statistics.avgWater} <span className="text-xl">ml</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-cyan-600 mt-2">
                    Total: {(currentHealthData.statistics.totalWater / 1000).toFixed(1)} L
                  </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-500 p-3 rounded-lg">
                        <Moon className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-indigo-700">Avg Sleep/Day</p>
                        <p className="text-3xl font-bold text-indigo-900 mt-1">
                          {currentHealthData.statistics.avgSleep} <span className="text-xl">hrs</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-indigo-600 mt-2">
                    Total: {currentHealthData.statistics.totalSleep.toFixed(1)} hours
                  </div>
                </div>
              </div>
            )}

            {/* Steps and Sleep Combined Chart */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Footprints className="text-white" size={22} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Daily Steps & Sleep Hours</h3>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    style={{ fontSize: "11px", fontWeight: 500 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: "#6b7280" }}
                  />
                  <YAxis
                    yAxisId="left"
                    label={{ 
                      value: "Steps", 
                      angle: -90, 
                      position: "insideLeft", 
                      style: { fontSize: "12px", fill: "#3b82f6", fontWeight: 600 } 
                    }}
                    stroke="#3b82f6"
                    style={{ fontSize: "11px" }}
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
                      style: { fontSize: "12px", fill: "#6366f1", fontWeight: 600 } 
                    }}
                    stroke="#6366f1"
                    style={{ fontSize: "11px" }}
                    tick={{ fill: "#6366f1" }}
                    domain={[0, 12]}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "30px", fontSize: "13px" }}
                    iconType="circle"
                    align="center"
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="steps"
                    name="Steps"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    opacity={0.9}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="sleepHours"
                    name="Sleep Hours"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: "#6366f1", r: 5, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 7, strokeWidth: 2, stroke: "#fff" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Water Intake Chart */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-cyan-500 p-2 rounded-lg">
                  <Droplet className="text-white" size={22} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Water Intake (ml)</h3>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    style={{ fontSize: "11px", fontWeight: 500 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: "#6b7280" }}
                  />
                  <YAxis
                    label={{ 
                      value: "Water Intake (ml)", 
                      angle: -90, 
                      position: "insideLeft", 
                      style: { fontSize: "12px", fill: "#06b6d4", fontWeight: 600 } 
                    }}
                    stroke="#06b6d4"
                    style={{ fontSize: "11px" }}
                    tick={{ fill: "#06b6d4" }}
                    tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}L` : `${value}ml`}
                    domain={[0, 'dataMax']}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "30px", fontSize: "13px" }}
                    iconType="circle"
                    align="center"
                  />
                  <Bar
                    dataKey="waterIntake"
                    name="Water Intake"
                    fill="#06b6d4"
                    radius={[6, 6, 0, 0]}
                    opacity={0.9}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <Heart className="text-gray-400" size={40} />
            </div>
            <p className="text-lg font-medium text-gray-700 mb-1">No health data available</p>
            <p className="text-sm text-gray-500">Health data will appear here once recorded</p>
          </div>
        )}
      </div>

     

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-primary" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
        </div>
        <div className="space-y-4">
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recent activities
            </div>
          ) : (
            recentActivities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="p-2 bg-primary-light rounded-lg">
                {activity.type === "appointment" ? (
                  <Calendar className="text-primary" size={20} />
                ) : activity.type === "record" ? (
                  <FileText className="text-primary" size={20} />
                ) : (
                  <Stethoscope className="text-primary" size={20} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {activity.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {activity.date} at {activity.time}
                </p>
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 bg-primary-light hover:bg-primary rounded-lg transition-colors text-left group">
            <Calendar className="text-primary group-hover:text-white transition-colors" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-white transition-colors">Book Appointment</h3>
              <p className="text-sm text-gray-600 group-hover:text-white/80 transition-colors">Schedule a visit</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-primary-light hover:bg-primary rounded-lg transition-colors text-left">
            <FileText className="text-primary" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900">View Records</h3>
              <p className="text-sm text-gray-600">Medical history</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-primary-light hover:bg-primary rounded-lg transition-colors text-left">
            <Stethoscope className="text-primary" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900">Prescriptions</h3>
              <p className="text-sm text-gray-600">View medications</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;

