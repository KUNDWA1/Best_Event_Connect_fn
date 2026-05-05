import { useState } from "react";
import { Bell } from "lucide-react";

interface ResponsiveDashboardNavProps {
  title: string;
  userInitial: string;
  bgColor: string;
  onLogout?: () => void;
}

export default function ResponsiveDashboardNav({
  title,
  userInitial,
  bgColor,
  onLogout,
}: ResponsiveDashboardNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-2xl font-bold text-primary">
            {title}
          </h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="text-gray-600 hover:text-primary p-2">
              <Bell className="w-6 h-6" />
            </button>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`w-8 h-8 sm:w-10 sm:h-10 ${bgColor} rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base`}
              >
                {userInitial}
              </button>
              {menuOpen && onLogout && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 animate-scale-in">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 hover:bg-background text-neutral"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
