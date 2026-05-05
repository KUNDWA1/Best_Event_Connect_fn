import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="relative bg-gradient-to-br from-neutral via-primary to-primary-soft dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary-soft rounded-full filter blur-3xl opacity-10"></div>
      <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-accent rounded-full filter blur-3xl opacity-10"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Logo className="w-8 h-8 sm:w-10 sm:h-10" />
              <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Event Connect
              </span>
            </Link>
            <p className="text-gray-300 mb-6 leading-relaxed text-sm sm:text-base">
              {t("about.tagline")}
            </p>
            <div className="flex gap-3 sm:gap-4">
              {[
                { Icon: Facebook, label: "facebook" },
                { Icon: Twitter, label: "twitter" },
                { Icon: Instagram, label: "instagram" },
                { Icon: Linkedin, label: "linkedin" },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center hover:bg-opacity-20 hover:scale-110 transition-all duration-300"
                >
                  <social.Icon className="w-5 h-5 text-white" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-accent">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-sm sm:text-base text-gray-300 hover:text-white hover:translate-x-2 inline-block transition-all duration-300"
                >
                  → {t("nav.home")}
                </Link>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-sm sm:text-base text-gray-300 hover:text-white hover:translate-x-2 inline-block transition-all duration-300"
                >
                  → {t("nav.about")}
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-sm sm:text-base text-gray-300 hover:text-white hover:translate-x-2 inline-block transition-all duration-300"
                >
                  → {t("footer.services")}
                </a>
              </li>
              <li>
                <Link
                  to="/get-started"
                  className="text-sm sm:text-base text-gray-300 hover:text-white hover:translate-x-2 inline-block transition-all duration-300"
                >
                  → {t("footer.events")}
                </Link>
              </li>
              <li>
                <Link
                  to="/get-started"
                  className="text-sm sm:text-base text-gray-300 hover:text-white hover:translate-x-2 inline-block transition-all duration-300"
                >
                  → {t("footer.vendors")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-accent">
              {t("footer.forUsers")}
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link
                  to="/get-started"
                  className="text-sm sm:text-base text-gray-300 hover:text-white hover:translate-x-2 inline-block transition-all duration-300"
                >
                  → {t("footer.findVendors")}
                </Link>
              </li>
              <li>
                <Link
                  to="/get-started"
                  className="text-sm sm:text-base text-gray-300 hover:text-white hover:translate-x-2 inline-block transition-all duration-300"
                >
                  → {t("footer.postEvent")}
                </Link>
              </li>
              <li>
                <Link
                  to="/get-started"
                  className="text-sm sm:text-base text-gray-300 hover:text-white hover:translate-x-2 inline-block transition-all duration-300"
                >
                  → {t("footer.becomeVendor")}
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-gray-300 hover:text-white hover:translate-x-2 inline-block transition-all duration-300"
                >
                  → {t("footer.pricing")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-gray-300 hover:text-white hover:translate-x-2 inline-block transition-all duration-300"
                >
                  → {t("footer.support")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-accent">
              {t("footer.contact")}
            </h4>
            <ul className="space-y-2 sm:space-y-3 text-gray-300">
              <li className="flex items-start gap-2 text-sm sm:text-base">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{t("footer.addressValue")}</span>
              </li>
              <li className="flex items-start gap-2 text-sm sm:text-base">
                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <a
                  href="tel:+250790110543"
                  className="hover:text-white transition-colors"
                >
                  0790110543
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm sm:text-base">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:kundwa1tech@gmail.com"
                  className="hover:text-white transition-colors break-all"
                >
                  kundwa1tech@gmail.com
                </a>
              </li>
            </ul>
            <div className="mt-4 sm:mt-6">
              <h5 className="text-xs sm:text-sm font-semibold mb-2">
                {t("footer.newsletter")}
              </h5>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={t("footer.yourEmail")}
                  className="flex-1 px-3 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 focus:outline-none focus:border-opacity-40 text-xs sm:text-sm"
                />
                <button className="bg-accent text-neutral px-3 sm:px-4 py-2 rounded-lg hover:bg-yellow-400 transition-all duration-300 font-semibold text-xs sm:text-sm">
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white border-opacity-10 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-xs sm:text-sm text-center md:text-left">
              © {new Date().getFullYear()} Event Connect. {t("footer.rights")}
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                {t("footer.privacyPolicy")}
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                {t("footer.termsOfService")}
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                {t("footer.cookiePolicy")}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent"></div>
    </footer>
  );
}
