import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LogOut, User } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";
import LanguageDropdown from "./LanguageDropdown";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleNavClick = (href: string) => {
    if (href.startsWith("/#")) {
      const section = href.substring(2);
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const element = document.getElementById(section);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } else {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else {
      navigate(href);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg"
          : "bg-primary dark:bg-gray-800 shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <span
              className={`text-lg sm:text-2xl font-bold ${isScrolled ? "text-primary dark:text-white" : "text-white"}`}
            >
              Event Connect
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {[
              { name: t("nav.home"), href: "/#home" },
              { name: t("nav.events"), href: "/events" },
              { name: t("nav.about"), href: "/#about" },
              { name: t("nav.services"), href: "/#services" },
              { name: t("nav.features"), href: "/#features" },
            ].map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className={`px-3 lg:px-4 py-2 font-medium rounded-lg transition-all duration-300 ${
                  isScrolled
                    ? "text-neutral dark:text-gray-200 hover:text-primary dark:hover:text-white hover:bg-background dark:hover:bg-gray-700"
                    : "text-white hover:bg-primary-soft dark:hover:bg-gray-700"
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <LanguageDropdown isScrolled={isScrolled} />
            <DarkModeToggle />
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isScrolled
                      ? "text-neutral dark:text-gray-200 hover:bg-background dark:hover:bg-gray-700"
                      : "text-white hover:bg-primary-soft dark:hover:bg-gray-700"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user.firstName}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b dark:border-gray-600">
                      <p className="text-sm font-semibold text-neutral dark:text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {user.role}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="w-full text-left px-4 py-2 text-sm text-neutral dark:text-gray-200 hover:bg-background dark:hover:bg-gray-600 transition-colors"
                    >
                      {t("dashboard.overview")}
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        navigate("/");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("dashboard.logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-3 lg:px-5 py-2 font-medium rounded-lg transition-all duration-300 text-sm lg:text-base ${
                    isScrolled
                      ? "text-neutral dark:text-gray-200 hover:text-primary dark:hover:text-white hover:bg-background dark:hover:bg-gray-700"
                      : "text-white hover:bg-primary-soft dark:hover:bg-gray-700"
                  }`}
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/get-started"
                  className="px-4 lg:px-6 py-2 lg:py-2.5 bg-accent text-neutral rounded-lg font-semibold hover:bg-yellow-400 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm lg:text-base"
                >
                  {t("nav.getStarted")}
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-all duration-300"
          >
            <svg
              className={`w-6 h-6 ${isScrolled ? "text-primary dark:text-white" : "text-white"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 animate-slide-up">
            <div className="flex flex-col space-y-2">
              {[
                { name: t("nav.home"), href: "/#home" },
                { name: t("nav.events"), href: "/events" },
                { name: t("nav.about"), href: "/#about" },
                { name: t("nav.services"), href: "/#services" },
                { name: t("nav.features"), href: "/#features" },
              ].map((link) => (
                <button
                  key={link.name}
                  onClick={() => {
                    handleNavClick(link.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-4 py-2 font-medium rounded-lg transition-all duration-300 text-left ${
                    isScrolled
                      ? "text-neutral dark:text-gray-200 hover:bg-background dark:hover:bg-gray-700"
                      : "text-white hover:bg-primary-soft dark:hover:bg-gray-700"
                  }`}
                >
                  {link.name}
                </button>
              ))}
              {isAuthenticated && user ? (
                <>
                  <button
                    onClick={() => {
                      navigate("/dashboard");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-4 py-2 font-medium rounded-lg transition-all duration-300 text-left ${
                      isScrolled
                        ? "text-neutral dark:text-gray-200 hover:bg-background dark:hover:bg-gray-700"
                        : "text-white hover:bg-primary-soft dark:hover:bg-gray-700"
                    }`}
                  >
                    {t("dashboard.overview")}
                  </button>
                  <div className="px-4 py-2 border-t dark:border-gray-600">
                    <p className="text-sm font-semibold text-neutral dark:text-white">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                      navigate("/");
                    }}
                    className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    {t("dashboard.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-2 font-medium rounded-lg transition-all duration-300 ${
                      isScrolled
                        ? "text-neutral dark:text-gray-200 hover:bg-background dark:hover:bg-gray-700"
                        : "text-white hover:bg-primary-soft dark:hover:bg-gray-700"
                    }`}
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/get-started"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2.5 bg-accent text-neutral rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-300 shadow-lg text-center"
                  >
                    {t("nav.getStarted")}
                  </Link>
                </>
              )}
              <div className="px-4 py-2 flex gap-2">
                <LanguageDropdown isScrolled={isScrolled} />
                <DarkModeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
