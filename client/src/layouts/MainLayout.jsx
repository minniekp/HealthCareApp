import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useRole } from "../hooks/useRole";
import {
  LayoutDashboard,
  Heart,
  LogOut,
  Menu,
  X,
  ChevronDown,
  UserCircle,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import AdminBadge from "../components/AdminBadge";
import Modal from "../components/Modal";
import api from "../utils/api";

const MainLayout = () => {
  const authStore = useAuthStore();
  const { user, logout, setUser } = authStore || {};
  const { isAdmin } = useRole();
  
  // Ensure user is loaded from localStorage
  useEffect(() => {
    if (!user && setUser) {
      const currentUser = api.auth.getCurrentUser();
      if (currentUser && setUser) {
        setUser(currentUser);
      }
    }
  }, [user, setUser]);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      if (logout) {
        await logout();
      } else {
        await api.auth.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setShowLogoutModal(false);
      navigate("/login");
    }
  };

  const navItems = [
    {
      path: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      roles: ["patient", "doctor"],
    },
  ];

  // Patient Profile link (shown at bottom of sidebar)
  const patientProfileItem = {
    path: "/profile",
    icon: UserCircle,
    label: "Patient Profile",
    roles: ["patient", "doctor"],
  };

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role || "patient")
  );

  // Check if patient profile should be shown
  const showPatientProfile = patientProfileItem.roles.includes(
    user?.role || "patient"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full top-0 z-30 h-20">
        <div className="flex items-center justify-between px-4 py-4 h-full">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary rounded-lg">
                <Heart className="text-white" size={24} />
              </div>
              <h1 className="text-xl font-bold text-primary hidden sm:block">
                Healthcare App
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
              >
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {user?.firstname?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="font-semibold text-gray-900">
                    {user?.firstname && user?.lastname 
                      ? `${user.firstname} ${user.lastname}` 
                      : user?.name || "User"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{user?.email}</span>
                    {isAdmin && <AdminBadge />}
                  </div>
                </div>
                <ChevronDown
                  size={20}
                  className={`text-gray-400 transition-transform ${
                    showProfileDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-slideDown">
                  {/* User Info (visible on mobile) */}
                  <div className="sm:hidden px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900">
                      {user?.firstname && user?.lastname 
                        ? `${user.firstname} ${user.lastname}` 
                        : user?.name || "User"}
                    </p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    {isAdmin && (
                      <div className="mt-2">
                        <AdminBadge />
                      </div>
                    )}
                  </div>

                  {/* Profile Option */}
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      navigate("/profile");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <UserCircle size={20} className="text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Profile
                      </p>
                      <p className="text-xs text-gray-500">View your profile</p>
                    </div>
                  </button>

                  {/* Logout Option */}
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleLogoutClick();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left border-t border-gray-100"
                  >
                    <LogOut size={20} className="text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-600">Logout</p>
                      <p className="text-xs text-gray-500">
                        Sign out of your account
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-20 bottom-0 w-64 bg-white border-r border-gray-200 transition-transform duration-300 z-20 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <nav className="p-4 space-y-1 flex-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-700 hover:bg-primary-light hover:text-primary"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Patient Profile at bottom of sidebar */}
        {showPatientProfile && (() => {
          const ProfileIcon = patientProfileItem.icon;
          const isActive = location.pathname === patientProfileItem.path;
          return (
            <div className="p-4 border-t border-gray-200">
              <Link
                to={patientProfileItem.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-700 hover:bg-primary-light hover:text-primary"
                }`}
              >
                <ProfileIcon size={20} />
                <span className="font-medium">{patientProfileItem.label}</span>
              </Link>
            </div>
          );
        })()}
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 mt-20 p-6">
        <Outlet />
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 lg:hidden animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title=""
        size="sm"
      >
        <div className="space-y-6">
          {/* Icon and Title */}
          <div className="flex flex-col items-center text-center pt-2">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <LogOut className="text-red-600" size={36} strokeWidth={2} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
            <p className="text-gray-600 text-sm max-w-sm">
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={confirmLogout}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 active:from-red-800 active:to-red-900 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogOut size={18} strokeWidth={2.5} />
              Yes, Logout
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MainLayout;

