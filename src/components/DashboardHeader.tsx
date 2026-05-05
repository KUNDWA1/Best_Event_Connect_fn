import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faComments, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import DarkModeToggle from "./DarkModeToggle";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  userName?: string;
  userInitials?: string;
}

export default function DashboardHeader({
  title,
  subtitle,
  userName = "User",
  userInitials = "U",
}: DashboardHeaderProps) {
  const { t } = useTranslation();
  return (
    <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-30 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral dark:text-white">{title}</h1>
          {subtitle && (
            <p className="text-sm text-neutral text-opacity-60 dark:text-gray-300 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="relative hidden md:block">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder={t("common.search")}
              className="w-64 lg:w-72 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-background dark:bg-gray-900 text-neutral dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <button className="relative p-2 text-neutral dark:text-gray-200 hover:bg-background dark:hover:bg-gray-700 rounded-lg transition-colors hover:text-primary">
            <FontAwesomeIcon icon={faComments} className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-soft rounded-full"></span>
          </button>
          <DarkModeToggle />
          <button className="relative p-2 text-neutral dark:text-gray-200 hover:bg-background dark:hover:bg-gray-700 rounded-lg transition-colors hover:text-primary">
            <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-neutral dark:text-white">{userName}</p>
              <p className="text-xs text-neutral text-opacity-50 dark:text-gray-400">{t("chat.online")}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-soft rounded-full flex items-center justify-center text-white font-semibold hover:shadow-md transition">
              {userInitials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
