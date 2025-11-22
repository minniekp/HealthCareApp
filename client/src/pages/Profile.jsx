import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Calendar,
  Heart,
  Edit,
  Stethoscope,
} from "lucide-react";
import api from "../utils/api";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = api.auth.getCurrentUser();
    setUser(currentUser);
  }, []);

  const formatDate = (dateString) => {
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg">
              {user?.firstname?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.firstname && user?.lastname
                  ? `${user.firstname} ${user.lastname}`
                  : user?.name || "User"}
              </h1>
              <p className="text-gray-600 capitalize">
                {user?.role || "Patient"}
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors">
            <Edit size={18} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <User className="text-primary" size={24} />
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500">
              First Name
            </label>
            <p className="text-gray-900 font-medium">
              {user?.firstname || "Not provided"}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500">
              Last Name
            </label>
            <p className="text-gray-900 font-medium">
              {user?.lastname || "Not provided"}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Mail size={16} className="text-gray-400" />
              Email Address
            </label>
            <p className="text-gray-900 font-medium">
              {user?.email || "Not provided"}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              Date of Birth
            </label>
            <p className="text-gray-900 font-medium">
              {formatDate(user?.DOB)}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500">Age</label>
            <p className="text-gray-900 font-medium">
              {getAge(user?.DOB)} years old
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Heart size={16} className="text-gray-400" />
              Gender
            </label>
            <p className="text-gray-900 font-medium">
              {formatGender(user?.gender)}
            </p>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <User className="text-primary" size={24} />
          Account Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500">User ID</label>
            <p className="text-gray-900 font-mono text-sm">
              {user?.id || user?._id || "N/A"}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500">Account Role</label>
            <span className="inline-block px-3 py-1 bg-primary-light text-primary rounded-full text-sm font-medium capitalize">
              {user?.role || "Patient"}
            </span>
          </div>
        </div>
      </div>

      {/* Role-specific Information */}
      {user?.role === "doctor" ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Stethoscope className="text-primary" size={24} />
            Professional Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">
                Specialization
              </label>
              <p className="text-gray-900 font-medium">
                General Practitioner
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">
                License Number
              </label>
              <p className="text-gray-900 font-medium">MD-12345</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">
                Years of Experience
              </label>
              <p className="text-gray-900 font-medium">
                {getAge(user?.DOB) > 30 ? "10+ years" : "5+ years"}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">
                Total Patients
              </label>
              <p className="text-gray-900 font-medium">3 patients</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Heart className="text-primary" size={24} />
            Medical Summary
          </h2>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <Heart className="text-gray-400 mx-auto mb-2" size={32} />
            <p className="text-gray-600">No medical records available yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Your medical information will appear here once available
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

