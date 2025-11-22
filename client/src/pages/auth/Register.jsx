import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Calendar,
  Loader2,
  Heart,
  Stethoscope,
  Calendar as CalendarIcon,
  Users,
} from "lucide-react";
import api from "../../utils/api";
import InputField from "../../components/common/InputField";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    DOB: "",
    gender: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errors, setErrors] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    DOB: "",
    gender: "",
  });

  const validateForm = () => {
    const newErrors = {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
      DOB: "",
      gender: "",
    };
    let isValid = true;

    // First name validation
    if (!formData.firstname) {
      newErrors.firstname = "First name is required";
      isValid = false;
    } else if (formData.firstname.length < 2) {
      newErrors.firstname = "First name must be at least 2 characters";
      isValid = false;
    }

    // Last name validation
    if (!formData.lastname) {
      newErrors.lastname = "Last name is required";
      isValid = false;
    } else if (formData.lastname.length < 2) {
      newErrors.lastname = "Last name must be at least 2 characters";
      isValid = false;
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    // DOB validation
    if (!formData.DOB) {
      newErrors.DOB = "Date of birth is required";
      isValid = false;
    } else {
      const dobDate = new Date(formData.DOB);
      const today = new Date();
      if (dobDate >= today) {
        newErrors.DOB = "Date of birth must be in the past";
        isValid = false;
      }
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Clear previous errors
    setErrors({
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
      DOB: "",
      gender: "",
    });

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsLoading(true);

    try {
      await api.auth.register(
        formData.firstname,
        formData.lastname,
        formData.email,
        formData.password,
        formData.DOB,
        formData.gender
      );
      toast.success("Account created successfully! Redirecting...");
      setIsRedirecting(true);

      // Small delay to show the success message
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      console.error("Registration error:", error);

      const errorMessage =
        error.message || "Registration failed. Please try again.";

      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center",
      });

      // Set specific field error if message contains field name
      if (errorMessage.toLowerCase().includes("email")) {
        setErrors({ ...errors, email: errorMessage });
      } else if (errorMessage.toLowerCase().includes("firstname") || errorMessage.toLowerCase().includes("first name")) {
        setErrors({ ...errors, firstname: errorMessage });
      } else if (errorMessage.toLowerCase().includes("lastname") || errorMessage.toLowerCase().includes("last name")) {
        setErrors({ ...errors, lastname: errorMessage });
      } else if (errorMessage.toLowerCase().includes("dob") || errorMessage.toLowerCase().includes("date")) {
        setErrors({ ...errors, DOB: errorMessage });
      } else if (errorMessage.toLowerCase().includes("gender")) {
        setErrors({ ...errors, gender: errorMessage });
      } else {
        setErrors({ ...errors, password: errorMessage });
      }
    } finally {
      setIsLoading(false);
      setIsRedirecting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field when user starts typing
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand & Info (Hidden on mobile, visible on lg+) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col justify-between p-12 text-white relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3 mb-16">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <Heart size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold">Healthcare App</h1>
          </div>

          {/* Main Description */}
          <div className="space-y-6 max-w-md">
            <h2 className="text-4xl font-bold leading-tight">
              Start Your Health Journey Today
            </h2>
            <p className="text-lg text-white/80 leading-relaxed">
              Join thousands of patients using our platform to manage their
              health, connect with doctors, and take control of their wellness
              journey.
            </p>

            {/* Features */}
            <div className="space-y-4 mt-12">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <Stethoscope size={24} />
                </div>
                <div>
                  <h3 className="font-semibold">Easy Health Management</h3>
                  <p className="text-sm text-white/70">
                    Track your health records instantly
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <CalendarIcon size={24} />
                </div>
                <div>
                  <h3 className="font-semibold">Appointment Booking</h3>
                  <p className="text-sm text-white/70">
                    Schedule appointments with ease
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-semibold">Doctor Connections</h3>
                  <p className="text-sm text-white/70">
                    Connect with healthcare professionals
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-white/60 text-sm">
          <p>&copy; 2024 Healthcare App. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="p-2 rounded-lg bg-primary">
              <Heart size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-primary">
              Healthcare App
            </h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-primary-light">
                <UserPlus size={32} className="text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Create Account
              </h2>
              <p className="text-gray-600 mt-2">Sign up to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  placeholder="John"
                  error={errors.firstname}
                  disabled={isLoading || isRedirecting}
                  icon={User}
                  required
                />
                <InputField
                  label="Last Name"
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder="Doe"
                  error={errors.lastname}
                  disabled={isLoading || isRedirecting}
                  icon={User}
                  required
                />
              </div>

              <InputField
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                error={errors.email}
                disabled={isLoading || isRedirecting}
                icon={Mail}
                required
              />

              <InputField
                label="Date of Birth"
                type="date"
                name="DOB"
                value={formData.DOB}
                onChange={handleChange}
                error={errors.DOB}
                disabled={isLoading || isRedirecting}
                icon={Calendar}
                required
              />

              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`input-field pl-10 ${
                      errors.gender ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                    disabled={isLoading || isRedirecting}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {errors.gender && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <span>{errors.gender}</span>
                  </div>
                )}
              </div>

              <InputField
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.password}
                disabled={isLoading || isRedirecting}
                icon={Lock}
                showPasswordToggle
                showPassword={showPassword}
                onTogglePassword={togglePasswordVisibility}
                required
              />

              <InputField
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.confirmPassword}
                disabled={isLoading || isRedirecting}
                icon={Lock}
                showPasswordToggle
                showPassword={showConfirmPassword}
                onTogglePassword={toggleConfirmPasswordVisibility}
                required
              />

              <button
                type="submit"
                disabled={isLoading || isRedirecting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-white font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-50"
              >
                {isLoading || isRedirecting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>
                      {isRedirecting ? "Redirecting..." : "Creating account..."}
                    </span>
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

