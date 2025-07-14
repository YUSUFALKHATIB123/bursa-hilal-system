import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import GlobalSearch from "./GlobalSearch";
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Globe,
  ChevronDown,
  Package,
  DollarSign,
  AlertTriangle,
  UserCheck,
} from "lucide-react";

interface NavbarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  isMobile?: boolean;
}

export default function Navbar({
  sidebarOpen,
  toggleSidebar,
  isMobile = false,
}: NavbarProps) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Check if click is outside notifications dropdown
      if (notificationsOpen && !target.closest('[data-notifications-dropdown]') && !target.closest('[data-notifications-button]')) {
        setNotificationsOpen(false);
      }
      
      // Check if click is outside user menu dropdown
      if (userMenuOpen && !target.closest('[data-user-dropdown]') && !target.closest('[data-user-button]')) {
        setUserMenuOpen(false);
      }
    };

    if (notificationsOpen || userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [notificationsOpen, userMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNotificationClick = (notification: any) => {
    // Mark notification as read
    markAsRead(notification.id);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'order':
        navigate('/orders');
        break;
      case 'payment':
      case 'invoice':
        navigate('/invoices');
        break;
      case 'stock':
      case 'inventory':
        navigate('/inventory');
        break;
      case 'employee':
        navigate('/employees');
        break;
      case 'customer':
        navigate('/customers');
        break;
      case 'supplier':
        navigate('/suppliers');
        break;
      default:
        navigate('/notifications');
        break;
    }
    
    // Close notifications dropdown
    setNotificationsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="w-4 h-4 text-blue-500" />;
      case "payment":
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case "stock":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "employee":
        return <UserCheck className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200 backdrop-blur-md bg-white/95"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6">
        {/* Left side - Mobile menu + Search */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1">
          {/* Mobile menu button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            style={{
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <Menu className="w-5 h-5" />
          </motion.button>

          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t("search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowGlobalSearch(true)}
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-primary focus:border-transparent transition-all"
                style={{
                  fontSize: "16px", // Prevent zoom on iOS
                  touchAction: "manipulation",
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Language toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            className="flex items-center space-x-1 px-2 sm:px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            style={{
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">
              {language === "ar" ? "عربي" : "EN"}
            </span>
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                setNotificationsOpen(!notificationsOpen);
              }}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              data-notifications-button
              style={{
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-medium"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </motion.span>
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-40 max-h-96 overflow-hidden"
                  data-notifications-dropdown
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      {t("notifications")}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800 touch-manipulation"
                        >
                          {t("mark_all_read")}
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setNotificationsOpen(false);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded touch-manipulation"
                        title="إغلاق"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="max-h-64 sm:max-h-80 overflow-y-auto scrollbar-thin">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-500 text-sm">
                        {t("no_notifications")}
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <motion.div
                          key={notification.id}
                          whileHover={{ backgroundColor: "#f9fafb" }}
                          onClick={() => handleNotificationClick(notification)}
                          className={`px-4 py-3 border-b border-gray-100 last:border-0 transition-colors cursor-pointer hover:shadow-sm ${
                            !notification.read ? "bg-blue-50" : ""
                          }`}
                          style={{ touchAction: "manipulation" }}
                          title="اضغط للانتقال إلى الصفحة المتعلقة"
                        >
                          <div className="flex items-start space-x-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 break-words">
                                {typeof notification.title === 'string' ? notification.title : notification.title[language]}
                              </p>
                              <p className="text-xs text-gray-600 mt-1 break-words">
                                {typeof notification.message === 'string' ? notification.message : notification.message[language]}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                              )}
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800 p-1 rounded touch-manipulation opacity-60 hover:opacity-100"
                                  title={notification.read ? "مقروء" : "وضع علامة كمقروء"}
                                >
                                  ✓
                                </button>
                                <span className="text-xs text-gray-400">
                                  →
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                  {notifications.length > 5 && (
                    <div className="px-4 py-2 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setNotificationsOpen(false);
                          navigate("/notifications");
                        }}
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-800 transition-colors touch-manipulation"
                      >
                        {t("view_all_notifications")}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                setUserMenuOpen(!userMenuOpen);
              }}
              className="flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              data-user-button
              style={{
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="hidden sm:flex flex-col items-start min-w-0 max-w-32">
                <span className="text-sm font-medium text-gray-700 truncate w-full">
                  {user?.name}
                </span>
                <span className="text-xs text-gray-500 truncate w-full">
                  {user?.role || "مدير النظام"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </motion.button>

            {/* User menu dropdown */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-40"
                  data-user-dropdown
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-primary rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 break-words">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-600 break-words">
                          {user?.email}
                        </p>
                        <p className="text-xs text-green-600 font-medium">
                          {user?.role || "مدير النظام"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/settings");
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors touch-manipulation"
                  >
                    <Settings className="w-4 h-4" />
                    <span>{t("settings")}</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors touch-manipulation"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t("logout")}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
      />
    </motion.header>
  );
}
