import { useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import Logo from "../components/Logo";
import { Eye, EyeOff, LogIn, AlertCircle, Globe } from "lucide-react";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const { language, setLanguage, t, dir } = useLanguage();
  const isArabic = String(language) === "ar";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError("Invalid email or password. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center p-4 ${isArabic ? "font-arabic" : ""}`}
      dir={dir}
    >
      {/* Language Toggle */}
      <motion.button
        onClick={() => setLanguage(isArabic ? "en" : "ar")}
        className={`fixed top-4 ${isArabic ? "left-4" : "right-4"} z-50 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Globe className="w-5 h-5 text-green-primary" />
        <span className={`text-sm font-medium text-green-primary`}>
          {language === "en" ? "عربي" : "English"}
        </span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-primary to-green-secondary p-8 text-white text-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Logo size="lg" className="w-20 h-20" fallbackText="BH" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isArabic ? "بورصة هلال" : t("bursaHilal")}
          </h1>
          <p className="text-green-100 mb-2">{t("factoryManagement")}</p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            {t("emailAddress")}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent transition-colors"
            placeholder={t("enterEmail")}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            {t("password")}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent transition-colors ${isArabic ? "pl-12 pr-4" : "pr-12 pl-4"}`}
              placeholder={t("enterPassword")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute inset-y-0 ${isArabic ? "left-3" : "right-3"} flex items-center text-gray-400 hover:text-gray-600`}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className={`w-full bg-gradient-to-r from-green-primary to-green-secondary text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${isArabic ? "space-x-reverse space-x-2" : "space-x-2"}`}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              <span>{t("signIn")}</span>
            </>
          )}
        </motion.button>
      </form>

      {/* Demo Credentials */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 bg-gray-50 rounded-lg"
      >
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          {t("demoAccounts")}
        </h3>
        <div className="text-xs text-gray-600 space-y-1">
          <p>
            <strong>{isArabic ? "مدير النظام" : "Admin"}:</strong> yusuf@bursahilal.com / admin123
          </p>
          <p>
            <strong>{isArabic ? "المالك" : "Owner"}:</strong> mustafa@bursahilal.com / owner123
          </p>
          <p>
            <strong>{isArabic ? "المدير المساعد" : "Manager"}:</strong> mohammad@bursahilal.com / manager123
          </p>
          <p>
            <strong>{isArabic ? "المحاسب" : "Accountant"}:</strong> accountant@bursahilal.com / account123
          </p>
          <p>
            <strong>{isArabic ? "مدير الإنتاج" : "Production"}:</strong> production@bursahilal.com / production123
          </p>
        </div>
      </motion.div>
    </div>
  </motion.div>
</div>
);
}
