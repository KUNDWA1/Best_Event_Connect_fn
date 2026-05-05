import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧', short: 'EN' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', short: 'FR' },
  { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼', short: 'RW' }
];

interface LanguageDropdownProps {
  isScrolled?: boolean;
}

export default function LanguageDropdown({ isScrolled = false }: LanguageDropdownProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(
    languages.find(l => i18n.language.startsWith(l.code)) ? i18n.language.slice(0, 2) : 'en'
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLang = languages.find(lang => lang.code === currentLang) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nLang', code);
    setCurrentLang(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 lg:px-5 py-2 font-medium rounded-lg transition-all duration-300 text-sm lg:text-base ${
          isScrolled
            ? "text-neutral dark:text-gray-200 hover:text-primary dark:hover:text-white hover:bg-background dark:hover:bg-gray-700"
            : "text-white hover:bg-primary-soft dark:hover:bg-gray-700"
        }`}
        title="Change Language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{selectedLang.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                currentLang === lang.code ? 'bg-blue-50 dark:bg-blue-900' : ''
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="text-sm font-medium dark:text-white">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
