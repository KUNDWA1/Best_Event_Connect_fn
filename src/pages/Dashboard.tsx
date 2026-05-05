import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VendorDashboard from "../components/VendorDashboard";
import PlannerDashboardContent from "../components/PlannerDashboardContent";
import AdminDashboard from "../components/AdminDashboard";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      {user.role === "vendor" ? (
        <VendorDashboard />
      ) : user.role === "admin" ? (
        <AdminDashboard />
      ) : (
        <PlannerDashboardContent />
      )}
    </div>
  );
}
