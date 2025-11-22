import {
  Calendar,
  Stethoscope,
  FileText,
  Activity,
  TrendingUp,
  Heart,
} from "lucide-react";

const PatientDashboard = ({ user }) => {
  const stats = [
    {
      title: "Upcoming Appointments",
      value: "3",
      icon: Calendar,
      color: "bg-blue-500",
    },
    {
      title: "Medical Records",
      value: "12",
      icon: FileText,
      color: "bg-green-500",
    },
    {
      title: "Active Prescriptions",
      value: "5",
      icon: Stethoscope,
      color: "bg-purple-500",
    },
    {
      title: "Health Score",
      value: "85%",
      icon: Activity,
      color: "bg-orange-500",
    },
  ];

  const recentActivities = [
    {
      title: "Appointment with Dr. Sarah Williams",
      date: "2024-11-25",
      time: "10:00 AM",
      type: "appointment",
    },
    {
      title: "Lab Results Updated",
      date: "2024-11-20",
      time: "2:30 PM",
      type: "record",
    },
    {
      title: "Prescription Renewed",
      date: "2024-11-18",
      time: "11:15 AM",
      type: "prescription",
    },
  ];

  // Health chart data (dummy data for now)
  const healthData = [
    { month: "Jan", value: 78 },
    { month: "Feb", value: 82 },
    { month: "Mar", value: 80 },
    { month: "Apr", value: 85 },
    { month: "May", value: 83 },
    { month: "Jun", value: 85 },
  ];

  const maxValue = Math.max(...healthData.map((d) => d.value));

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

      {/* Health Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="text-primary" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Health Trend</h2>
        </div>
        <div className="h-64 flex items-end justify-between gap-2">
          {healthData.map((data, index) => {
            const height = (data.value / maxValue) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full bg-primary rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                    title={`${data.month}: ${data.value}%`}
                  >
                    <div className="text-xs text-white font-semibold p-1 text-center">
                      {data.value}%
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2">{data.month}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-primary" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
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
          ))}
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

