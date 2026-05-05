import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User, Mail, Lock, UserCheck, ArrowRight, CheckCircle, Phone, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import TermsAndConditionsModal from "../components/TermsAndConditionsModal";

const TERMS_ACCEPTED_KEY = "eventConnectTermsAccepted";
const TERMS_ACCEPTED_DATE_KEY = "eventConnectTermsAcceptedDate";

export default function GetStarted() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    user_type: "planner" as "vendor" | "planner" | "admin",
    terms_accepted: false,
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Check if terms were previously accepted
  useEffect(() => {
    const accepted = localStorage.getItem(TERMS_ACCEPTED_KEY);
    if (!accepted) {
      setShowTermsModal(true);
    } else {
      setTermsAccepted(true);
      setFormData((prev) => ({ ...prev, terms_accepted: true }));
    }
  }, []);

  const handleTermsAccept = () => {
    localStorage.setItem(TERMS_ACCEPTED_KEY, "true");
    localStorage.setItem(TERMS_ACCEPTED_DATE_KEY, new Date().toISOString());
    setTermsAccepted(true);
    setFormData((prev) => ({ ...prev, terms_accepted: true }));
    setShowTermsModal(false);
  };

  const handleTermsDecline = () => {
    setShowTermsModal(false);
    navigate("/");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const [firstName, ...lastNameParts] = formData.full_name.trim().split(" ");
    const lastName = lastNameParts.join(" ").trim();
    if (!firstName || !lastName) {
      setLocalError(t("auth.fullNameRequired"));
      return;
    }
    try {
      await register({ firstName, lastName, email: formData.email, password: formData.password, phone: formData.phone, role: formData.user_type });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : t("auth.registrationFailed"));
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center py-12 px-4">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
          <div className="hidden md:block space-y-6 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold leading-tight text-neutral dark:text-white">{t("auth.welcomeToApp")}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">{t("auth.joinThousands")}</p>
            </div>

            <div className="space-y-4 pt-8">
              {[t("auth.connectVendors"), t("auth.planSeamlessly"), t("auth.securePayment")].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-accent" />
                  <span className="text-lg text-neutral dark:text-gray-200">{text}</span>
                </div>
              ))}
            </div>

            <div className="pt-8">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-around text-center">
                  <div>
                    <p className="text-3xl font-bold text-accent">500+</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("hero.verifiedVendors")}</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-accent">1000+</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("hero.eventsPlanned")}</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-accent">98%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("hero.satisfaction")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="animate-scale-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full mb-4">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t("auth.createAccount")}</h2>
                <p className="text-gray-600 dark:text-gray-300">{t("auth.joinToday")}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {(error || localError) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">{error || localError}</p>
                      <p className="text-xs text-red-700 mt-1">{t("auth.checkDetails")}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <UserCheck className="w-4 h-4 inline mr-2" />
                    {t("auth.role")} *
                  </label>
                  <select name="user_type" value={formData.user_type} onChange={handleChange} required disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed">
                    <option value="planner">{t("auth.planner")}</option>
                    <option value="vendor">{t("auth.vendor")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    {t("auth.fullName")} *
                  </label>
                  <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder={t("publicEvents.fullNamePlaceholder")} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    {t("auth.email")} *
                  </label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder={t("publicEvents.emailPlaceholder")} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    {t("auth.phone")} *
                  </label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="+250788000000" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    {t("auth.password")} *
                  </label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} required disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="••••••••" />
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => {
                        setTermsAccepted(e.target.checked);
                        setFormData((prev) => ({ ...prev, terms_accepted: e.target.checked }));
                      }}
                      disabled={loading}
                      className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary mt-0.5"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                      {t("auth.termsReadAgree")}{" "}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-primary hover:underline font-semibold"
                      >
                        {t("auth.termsAndConditions")}
                      </button>{" "}
                      {t("auth.termsOf")}
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !termsAccepted}
                  className="w-full bg-gradient-to-r from-primary to-primary-soft text-white py-3 rounded-lg font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? t("auth.creatingAccount") : t("auth.signupButton")}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600 dark:text-gray-300">
                  {t("auth.hasAccount")}{" "}
                  <Link to="/login" className="text-primary hover:underline font-semibold">{t("auth.loginLink")}</Link>
                </p>
              </div>
            </div>

            <div className="text-center mt-6">
              <Link to="/" className="text-gray-600 dark:text-gray-400 hover:underline inline-flex items-center gap-2">
                ← Event Connect
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Terms and Conditions Modal */}
      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onAccept={handleTermsAccept}
        onDecline={handleTermsDecline}
      />
    </>
  );
}
