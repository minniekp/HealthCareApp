import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Mail,
  Lock,
  Loader2,
  Heart,
  Calendar,
  Users,
  Stethoscope,
} from "lucide-react";
import api from "../../utils/api";
import InputField from "../../components/common/InputField";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

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

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Clear previous errors
    setErrors({ email: "", password: "" });

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsLoading(true);

    try {
      await api.auth.login(formData.email, formData.password);
      toast.success("Login successful! Redirecting...");
      setIsRedirecting(true);

      // Small delay to show the success message
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      console.error("Login error:", error);

      const errorMessage =
        error.message || "Invalid email or password. Please try again.";

      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center",
      });

      setErrors({
        email: errorMessage.toLowerCase().includes("email") ? errorMessage : "",
        password:
          errorMessage.toLowerCase().includes("password") ||
          errorMessage.toLowerCase().includes("credential")
            ? errorMessage
            : "Invalid credentials",
      });
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
              Your Health, Our Priority
            </h2>
            <p className="text-lg text-white/80 leading-relaxed">
              Access your medical records, schedule appointments, connect with
              healthcare providers, and manage your wellness journey all in one
              place.
            </p>

            {/* Features */}
            <div className="space-y-4 mt-12">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <Stethoscope size={24} />
                </div>
                <div>
                  <h3 className="font-semibold">Medical Records</h3>
                  <p className="text-sm text-white/70">
                    Access your complete health history
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="font-semibold">Appointment Scheduling</h3>
                  <p className="text-sm text-white/70">
                    Book and manage your appointments easily
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-semibold">Doctor Consultations</h3>
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

      {/* Right Side - Login Form */}
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
                <Heart size={32} className="text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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

              <button
                type="submit"
                disabled={isLoading || isRedirecting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-white font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-50"
              >
                {isLoading || isRedirecting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>
                      {isRedirecting ? "Redirecting..." : "Signing in..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Heart size={20} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
