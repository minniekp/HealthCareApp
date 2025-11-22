import { useState } from "react";
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
  Shield,
} from "lucide-react";
import Modal from "../Modal";
import api from "../../utils/api";

const AdminDashboard = ({ user, data }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Use real data from API or fallback to empty array
  const allUsers = data?.users || [];

  const stats = [
    {
      title: "Total Users",
      value: data?.stats?.totalUsers?.toString() || "0",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Total Patients",
      value: data?.stats?.totalPatients?.toString() || "0",
      icon: UserCircle,
      color: "bg-green-500",
    },
    {
      title: "Total Doctors",
      value: data?.stats?.totalDoctors?.toString() || "0",
      icon: Stethoscope,
      color: "bg-purple-500",
    },
    {
      title: "Total Activities",
      value: data?.stats?.totalActivities?.toString() || "0",
      icon: Activity,
      color: "bg-orange-500",
    },
  ];

  // Filter users based on search, role, and status
  const filteredUsers = allUsers.filter((userItem) => {
    const matchesSearch =
      userItem.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || userItem.role === filterRole;
    const matchesStatus = filterStatus === "all" || userItem.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
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

  const handleViewDetails = async (userItem) => {
    setSelectedUser(userItem);
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
    setNewRole("");
    setNewStatus("");
    setIsLoadingDetails(true);

    try {
      const response = await api.user.getUserById(userItem.id);
      if (response.success && response.data.user) {
        setUserDetails(response.data.user);
        setNewRole(response.data.user.role);
        setNewStatus(response.data.user.status || "active");
      } else {
        setError("Failed to load user details");
      }
    } catch (err) {
      console.error("Error loading user details:", err);
      setError(err.message || "Failed to load user details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !userDetails || !newRole) return;

    if (newRole === userDetails.role) {
      setError("User already has this role");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsUpdatingRole(true);

    try {
      const response = await api.user.updateUserRole(selectedUser.id, newRole);
      if (response.success) {
        setSuccess(
          `Successfully changed ${userDetails.firstname} ${userDetails.lastname} to ${newRole} role`
        );
        // Update user details
        setUserDetails((prev) => ({
          ...prev,
          role: newRole,
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

  const handleChangeStatus = async () => {
    if (!selectedUser || !userDetails || !newStatus) return;

    if (newStatus === (userDetails.status || "active")) {
      setError("User already has this status");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsUpdatingStatus(true);

    try {
      const response = await api.user.updateUserStatus(selectedUser.id, newStatus);
      if (response.success) {
        setSuccess(
          `Successfully changed ${userDetails.firstname} ${userDetails.lastname} status to ${newStatus}`
        );
        // Update user details
        setUserDetails((prev) => ({
          ...prev,
          status: newStatus,
        }));
        // Refresh dashboard data after a delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(response.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.message || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setUserDetails(null);
    setNewRole("");
    setNewStatus("");
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-primary rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome, {user?.firstname || user?.lastname || "Admin"}!
        </h1>
        <p className="text-white/90">Manage all users and system settings</p>
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

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Shield className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-gray-900">All Users</h2>
            <span className="px-2 py-1 bg-primary-light text-primary rounded-full text-sm font-medium">
              {filteredUsers.length}
            </span>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none appearance-none bg-white"
              >
                <option value="all">All Roles</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
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

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((userItem) => (
                  <tr
                    key={userItem.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold mr-3">
                          {userItem.firstname[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {userItem.firstname} {userItem.lastname}
                          </div>
                          <div className="text-sm text-gray-500">
                            {userItem.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          userItem.role === "doctor"
                            ? "bg-blue-100 text-blue-800"
                            : userItem.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {userItem.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {userItem.lastLogin ? formatDateTime(userItem.lastLogin) : "Never"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatShortDate(userItem.registeredAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          userItem.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {userItem.status.charAt(0).toUpperCase() +
                          userItem.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewDetails(userItem)}
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

      {/* User Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={userDetails ? `${userDetails.firstname} ${userDetails.lastname} - Details` : "User Details"}
        size="lg"
      >
        {isLoadingDetails ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <div className="text-gray-500">Loading user details...</div>
            </div>
          </div>
        ) : userDetails ? (
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

            {/* User Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {userDetails.firstname?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {userDetails.firstname} {userDetails.lastname}
                </h3>
                <p className="text-gray-600 capitalize">{userDetails.role}</p>
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
                  <p className="text-gray-900 font-medium">{userDetails.firstname}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Last Name</label>
                  <p className="text-gray-900 font-medium">{userDetails.lastname}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    Email
                  </label>
                  <p className="text-gray-900 font-medium">{userDetails.email}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    Date of Birth
                  </label>
                  <p className="text-gray-900 font-medium">{formatLongDate(userDetails.DOB)}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Age</label>
                  <p className="text-gray-900 font-medium">{getAge(userDetails.DOB)} years old</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Heart size={16} className="text-gray-400" />
                    Gender
                  </label>
                  <p className="text-gray-900 font-medium">{formatGender(userDetails.gender)}</p>
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
                  <p className="text-gray-900 font-mono text-sm">{userDetails.id}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Current Role</label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      userDetails.role === "doctor"
                        ? "bg-blue-100 text-blue-800"
                        : userDetails.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {userDetails.role}
                  </span>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Current Status</label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      (userDetails.status || "active") === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {userDetails.status || "active"}
                  </span>
                </div>
              </div>
            </div>

            {/* Role Change Section */}
            <div className="border-t border-gray-200 pt-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
                  <div>
                    <h5 className="font-semibold text-yellow-900 mb-1">Change User Role</h5>
                    <p className="text-sm text-yellow-800">
                      You can change this user's role. Select the new role from the dropdown below.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select New Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button
                  onClick={handleChangeRole}
                  disabled={isUpdatingRole || newRole === userDetails.role}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingRole ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating Role...
                    </>
                  ) : (
                    <>
                      <Shield size={18} />
                      Update Role
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Status Change Section */}
            <div className="border-t border-gray-200 pt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-blue-600 mt-0.5" size={20} />
                  <div>
                    <h5 className="font-semibold text-blue-900 mb-1">Change User Status</h5>
                    <p className="text-sm text-blue-800">
                      You can change this user's status to active or inactive. Select the new status from the dropdown below.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <button
                  onClick={handleChangeStatus}
                  disabled={isUpdatingStatus || newStatus === (userDetails.status || "active")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingStatus ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating Status...
                    </>
                  ) : (
                    <>
                      <UserCircle size={18} />
                      Update Status
                    </>
                  )}
                </button>
              </div>
            </div>

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
            No user details available
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;

