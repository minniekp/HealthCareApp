import { useState } from "react";
import {
  Users,
  Calendar,
  Stethoscope,
  Search,
  Filter,
  UserCircle,
  Mail,
  Phone,
  Clock,
} from "lucide-react";

const DoctorDashboard = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Dummy patient data - in real app, this would come from API
  const allocatedPatients = [
    {
      id: "1",
      firstname: "John",
      lastname: "Doe",
      email: "john.doe@example.com",
      age: 29,
      gender: "male",
      lastAppointment: "2024-11-20",
      nextAppointment: "2024-11-28",
      status: "active",
      condition: "Hypertension",
    },
    {
      id: "2",
      firstname: "Jane",
      lastname: "Smith",
      email: "jane.smith@example.com",
      age: 32,
      gender: "female",
      lastAppointment: "2024-11-18",
      nextAppointment: "2024-12-05",
      status: "active",
      condition: "Diabetes Type 2",
    },
    {
      id: "3",
      firstname: "Alice",
      lastname: "Johnson",
      email: "alice.johnson@example.com",
      age: 36,
      gender: "female",
      lastAppointment: "2024-11-15",
      nextAppointment: null,
      status: "inactive",
      condition: "Asthma",
    },
  ];

  const stats = [
    {
      title: "Total Patients",
      value: allocatedPatients.length.toString(),
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Active Patients",
      value: allocatedPatients.filter((p) => p.status === "active").length.toString(),
      icon: UserCircle,
      color: "bg-green-500",
    },
    {
      title: "Upcoming Appointments",
      value: allocatedPatients.filter((p) => p.nextAppointment).length.toString(),
      icon: Calendar,
      color: "bg-purple-500",
    },
    {
      title: "Pending Reviews",
      value: "8",
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

  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
                  Last Visit
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
                      {formatDate(patient.lastAppointment)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {patient.nextAppointment ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={16} className="text-primary" />
                          {formatDate(patient.nextAppointment)}
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
                      <button className="text-primary hover:text-primary-dark font-medium">
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
    </div>
  );
};

export default DoctorDashboard;

