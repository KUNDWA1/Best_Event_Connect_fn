import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDashboard,
  faCalendarAlt,
  faComments,
  faCreditCard,
  faDollarSign,
  faBullseye,
  faStar,
  faEnvelope,
  faLock,
  faCog,
  faSignOutAlt,
  faChevronLeft,
  faChevronRight,
  faCube,
  faCheckCircle,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import LanguageDropdown from "./LanguageDropdown";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  userType: "planner" | "vendor" | "admin";
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function DashboardSidebar({
  userType,
  activeTab,
  onTabChange,
}: SidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--dashboard-sidebar-width",
      isCollapsed ? "4rem" : "14rem",
    );

    return () => {
      document.documentElement.style.setProperty(
        "--dashboard-sidebar-width",
        "14rem",
      );
    };
  }, [isCollapsed]);

  const plannerLinks = [
    { id: "dashboard", icon: faDashboard, label: t("dashboard.overview") },
    { id: "my-events", icon: faCalendarAlt, label: t("dashboard.myEvents") },
    { id: "guests", icon: faUsers, label: t("dashboard.guests") },

    { id: "messages", icon: faComments, label: t("dashboard.messages") },
    { id: "payments", icon: faCreditCard, label: t("dashboard.payments") },
  ];

  const vendorLinks = [
    { id: "profile", icon: faDashboard, label: t("dashboard.profile") },
    { id: "bookings", icon: faCalendarAlt, label: t("vendor.bookings") },
    { id: "earnings", icon: faCreditCard, label: t("vendor.earnings") },
    { id: "messages", icon: faComments, label: t("dashboard.messages") },
  ];

  const adminLinks = [
    { id: "dashboard-overview", icon: faDashboard, label: t("admin.dashboard") },
    { id: "all-events", icon: faCalendarAlt, label: t("admin.events") },
    { id: "vendors", icon: faCube, label: t("admin.vendors") },
    { id: "manage-users", icon: faUsers, label: t("admin.users") },
    { id: "escrow-payments", icon: faCreditCard, label: t("admin.payments") },
    { id: "transaction-history", icon: faDollarSign, label: t("admin.transactionHistory") },
    { id: "refunds-disputes", icon: faLock, label: t("admin.refundsDisputes") },
    { id: "event-categories", icon: faBullseye, label: t("admin.eventCategories") },
    { id: "service-categories", icon: faStar, label: t("admin.serviceCategories") },
    { id: "announcements", icon: faEnvelope, label: t("admin.announcements") },
    { id: "reports-complaints", icon: faComments, label: t("admin.reportsComplaints") },
    { id: "reviews-management", icon: faCheckCircle, label: t("admin.reviewsManagement") },
    { id: "audit-logs", icon: faCog, label: t("admin.auditLogs") },
  ];

  const links =
    userType === "planner"
      ? plannerLinks
      : userType === "vendor"
        ? vendorLinks
        : adminLinks;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-primary text-white p-2 rounded-lg shadow-lg hover:bg-opacity-90 transition"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-primary to-primary-soft dark:from-[#1f2937] dark:to-[#111827] text-white border-r border-primary-soft dark:border-gray-700 flex flex-col transition-all duration-300 z-40 shadow-lg ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "w-16" : "w-56"}`}
      >
        {/* Logo Section */}
        {/* Logo Section */}
        <div
          className={`p-4 border-b border-white border-opacity-20 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}
        >
          <div className="flex items-center gap-2">
            {!isCollapsed && (
              <span className="text-sm font-bold whitespace-nowrap">
                Event Connect
              </span>
            )}
          </div>

          {/* Collapse Toggle - Desktop Only */}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center justify-center text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 transition"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
          )}
        </div>

        {/* Expand Button when Collapsed - Desktop Only */}
        {isCollapsed && (
          <div className="p-3 border-b border-white border-opacity-20 flex justify-center">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center justify-center text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 transition"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => {
                    onTabChange?.(link.id);
                    setIsMobileOpen(false);
                  }}
                  title={isCollapsed ? link.label : ""}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === link.id
                      ? "bg-accent text-neutral shadow-md transform scale-105"
                      : "text-white hover:bg-white hover:bg-opacity-20"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <FontAwesomeIcon icon={link.icon} className="w-5" />
                  {!isCollapsed && (
                    <span className="font-medium truncate">{link.label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div
          className={`p-3 border-t border-white border-opacity-20 space-y-2 ${isCollapsed ? "flex flex-col items-center" : ""}`}
        >
          {!isCollapsed && <LanguageDropdown />}
          <button
            onClick={() => onTabChange?.("settings")}
            title={isCollapsed ? t("dashboard.settings") : ""}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200 ${isCollapsed ? "justify-center" : ""}`}
          >
            <FontAwesomeIcon icon={faCog} className="w-5" />
            {!isCollapsed && (
              <span className="font-medium">{t("dashboard.settings")}</span>
            )}
          </button>
          <button
            onClick={handleLogout}
            title={isCollapsed ? t("dashboard.logout") : ""}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-red-500 hover:bg-opacity-80 transition-all duration-200 ${isCollapsed ? "justify-center" : ""}`}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="w-5" />
            {!isCollapsed && (
              <span className="font-medium">{t("dashboard.logout")}</span>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
