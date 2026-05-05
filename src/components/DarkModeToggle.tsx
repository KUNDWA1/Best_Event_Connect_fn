import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun, faDesktop } from "@fortawesome/free-solid-svg-icons";

const DarkModeToggle = () => {
  const { theme, actualTheme, setThemePreference } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themeOptions = [
    { value: "system" as const, label: "System", icon: faDesktop },
    { value: "light" as const, label: "Light", icon: faSun },
    { value: "dark" as const, label: "Dark", icon: faMoon },
  ];

  const currentOption = themeOptions.find(opt => opt.value === theme) || themeOptions[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-neutral dark:text-gray-200 hover:bg-background dark:hover:bg-gray-700 rounded-lg transition-colors"
        aria-label="Toggle dark mode"
        title={`Theme: ${currentOption.label} (${actualTheme === 'dark' ? 'Dark' : 'Light'} mode active)`}
      >
        {actualTheme === "light" ? (
          <FontAwesomeIcon icon={faSun} className="w-5 h-5 text-gray-600" />
        ) : (
          <FontAwesomeIcon icon={faMoon} className="w-5 h-5 text-accent" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="py-1">
            <p className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Theme
            </p>
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setThemePreference(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                  theme === option.value
                    ? "bg-primary/10 text-primary dark:text-primary"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <FontAwesomeIcon 
                  icon={option.icon} 
                  className={`w-4 h-4 ${theme === option.value ? 'text-primary' : ''}`}
                />
                <span>{option.label}</span>
                {theme === option.value && (
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                    {actualTheme === 'dark' ? '●' : '○'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DarkModeToggle;
