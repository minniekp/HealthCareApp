import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Calendar,
  Heart,
  Edit,
  Stethoscope,
  Lock,
  Save,
  X,
} from "lucide-react";
import api from "../utils/api";
import Modal from "../components/Modal";
import InputField from "../components/common/InputField";
import { useAuthStore } from "../stores/authStore";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { setUser: setAuthStoreUser } = useAuthStore();

  // Form state
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    DOB: "",
    gender: "",
    password: "",
    currentPassword: "",
  });

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Form validation errors
  const [errors, setErrors] = useState({});

  const loadProfile = async () => {
    try {
      const response = await api.user.getProfile();
      if (response.success && response.data.user) {
        const userData = response.data.user;
        setUser(userData);
        // Update auth store
        if (setAuthStoreUser) {
          setAuthStoreUser(userData);
        }
        // Update localStorage
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      // Fallback to localStorage
      const currentUser = api.auth.getCurrentUser();
      setUser(currentUser);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEditModal = () => {
    if (!user) return;
    
    // Format DOB for input (YYYY-MM-DD)
    const dobDate = user.DOB ? new Date(user.DOB).toISOString().split("T")[0] : "";
    
    setFormData({
      firstname: user.firstname || "",
      lastname: user.lastname || "",
      DOB: dobDate,
      gender: user.gender || "",
      password: "",
      currentPassword: "",
    });
    setErrors({});
    setError(null);
    setSuccess(null);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setFormData({
      firstname: "",
      lastname: "",
      DOB: "",
      gender: "",
      password: "",
      currentPassword: "",
    });
    setErrors({});
    setError(null);
    setSuccess(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.firstname && formData.firstname.trim().length < 2) {
      newErrors.firstname = "First name must be at least 2 characters";
    }
    if (formData.firstname && formData.firstname.trim().length > 50) {
      newErrors.firstname = "First name cannot exceed 50 characters";
    }

    if (formData.lastname && formData.lastname.trim().length < 2) {
      newErrors.lastname = "Last name must be at least 2 characters";
    }
    if (formData.lastname && formData.lastname.trim().length > 50) {
      newErrors.lastname = "Last name cannot exceed 50 characters";
    }

    if (formData.DOB) {
      const dobDate = new Date(formData.DOB);
      if (isNaN(dobDate.getTime())) {
        newErrors.DOB = "Invalid date format";
      }
    }

    if (formData.gender && !["male", "female", "other"].includes(formData.gender)) {
      newErrors.gender = "Invalid gender selection";
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Current password is required to change password";
      }
    }

    if (formData.currentPassword && !formData.password) {
      newErrors.password = "New password is required when providing current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);

      // Prepare update data (only include fields that have changed)
      const updateData = {};
      
      if (formData.firstname && formData.firstname.trim() !== user.firstname) {
        updateData.firstname = formData.firstname.trim();
      }
      if (formData.lastname && formData.lastname.trim() !== user.lastname) {
        updateData.lastname = formData.lastname.trim();
      }
      if (formData.DOB) {
        const dobDate = new Date(formData.DOB);
        const currentDob = new Date(user.DOB);
        if (dobDate.getTime() !== currentDob.getTime()) {
          updateData.DOB = formData.DOB;
        }
      }
      if (formData.gender && formData.gender !== user.gender) {
        updateData.gender = formData.gender;
      }
      if (formData.password) {
        updateData.password = formData.password;
        updateData.currentPassword = formData.currentPassword;
      }

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        setError("No changes to save");
        setIsSaving(false);
        return;
      }

      const response = await api.user.updateProfile(updateData);

      if (response.success) {
        setSuccess("Profile updated successfully!");
        // Reload profile data
        await loadProfile();
        // Close modal after a short delay
        setTimeout(() => {
          closeEditModal();
        }, 1500);
      } else {
        setError(response.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

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

  // Show loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-gray-500">Loading profile...</div>
        </div>
      </div>
    );
  }

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
          <button
            onClick={openEditModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
          >
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

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="Edit Profile"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <InputField
              label="First Name"
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleInputChange}
              placeholder="Enter first name"
              error={errors.firstname}
              icon={User}
            />

            {/* Last Name */}
            <InputField
              label="Last Name"
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleInputChange}
              placeholder="Enter last name"
              error={errors.lastname}
              icon={User}
            />

            {/* Date of Birth */}
            <InputField
              label="Date of Birth"
              type="date"
              name="DOB"
              value={formData.DOB}
              onChange={handleInputChange}
              error={errors.DOB}
              icon={Calendar}
            />

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none ${
                  errors.gender ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <span>{errors.gender}</span>
                </div>
              )}
            </div>
          </div>

          {/* Password Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lock size={20} className="text-primary" />
              Change Password (Optional)
            </h3>
            <div className="space-y-4">
              <InputField
                label="Current Password"
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter current password"
                error={errors.currentPassword}
                icon={Lock}
                showPasswordToggle={true}
                showPassword={showCurrentPassword}
                onTogglePassword={() => setShowCurrentPassword(!showCurrentPassword)}
              />

              <InputField
                label="New Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter new password (min 6 characters)"
                error={errors.password}
                icon={Lock}
                showPasswordToggle={true}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Leave password fields empty if you don't want to change your password.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={closeEditModal}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;

