import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import TermsAndConditionsModal from "../components/TermsAndConditionsModal";

const TERMS_ACCEPTED_KEY = "eventConnectTermsAccepted";
const TERMS_ACCEPTED_DATE_KEY = "eventConnectTermsAcceptedDate";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Check if terms were previously accepted (for pre-filling, but still show on login)
  useEffect(() => {
    // Always show terms modal on first render for login
    const accepted = localStorage.getItem(TERMS_ACCEPTED_KEY);
    if (!accepted) {
      setShowTermsModal(true);
    }
  }, []);

  const handleTermsAccept = () => {
    localStorage.setItem(TERMS_ACCEPTED_KEY, "true");
    localStorage.setItem(TERMS_ACCEPTED_DATE_KEY, new Date().toISOString());
    setTermsAccepted(true);
    setShowTermsModal(false);
  };

  const handleTermsDecline = () => {
    setShowTermsModal(false);
    navigate("/");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await login(formData.email, formData.password);
      setTimeout(() => navigate("/dashboard"), 100);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : t("auth.loginFailed"));
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center py-12 px-4">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
          <div className="hidden md:block space-y-6 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold leading-tight text-neutral dark:text-white">{t("auth.welcomeBack")}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">{t("auth.signInToContinue")}</p>
            </div>

            <div className="space-y-4 pt-8">
              {[
                t("auth.accessDashboard"),
                t("auth.manageEvents"),
                t("auth.connectVendors"),
              ].map((text, i) => (
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
                  <LogIn className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t("auth.login")}</h2>
                <p className="text-gray-600 dark:text-gray-300">{t("auth.welcomeBackToApp")}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {(error || localError) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">{error || localError}</p>
                      <p className="text-xs text-red-700 mt-1">{t("auth.checkCredentials")}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    {t("auth.email")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    {t("auth.password")}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" disabled={loading} className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed" />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">{t("auth.rememberMe")}</span>
                  </label>
                  <a href="#" className="text-sm text-primary hover:underline font-semibold">{t("auth.forgotPassword")}</a>
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
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

                <button
                  type="submit"
                  disabled={loading || !termsAccepted}
                  className="w-full bg-gradient-to-r from-primary to-primary-soft text-white py-3 rounded-lg font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      {t("auth.signingIn")}
                    </>
                  ) : (
                    <>
                      {t("auth.loginButton")}
                      <LogIn className="w-5 h-5" />
                    </>
                  )}
                </button>


              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600 dark:text-gray-300">
                  {t("auth.noAccount")}{" "}
                  <Link to="/get-started" className="text-primary hover:underline font-semibold">{t("auth.signupLink")}</Link>
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
