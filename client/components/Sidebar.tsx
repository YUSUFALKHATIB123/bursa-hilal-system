import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  FileText,
  Package,
  UserCheck,
  Bell,
  TrendingUp,
  Building2,
  MapPin,
  Settings,
} from "lucide-react";

interface SidebarProps {
  onItemClick?: () => void;
}

const menuItems = [
  {
    path: "/",
    icon: LayoutDashboard,
    label: { en: "Dashboard", ar: "لوحة التحكم" },
    permission: "*", // Always visible
  },
  {
    path: "/orders",
    icon: ShoppingCart,
    label: { en: "Orders Management", ar: "إدارة الطلبات" },
    permission: "orders",
  },
  {
    path: "/track-order",
    icon: MapPin,
    label: { en: "Track Order", ar: "تتبع الطلبات" },
    permission: "track-order",
  },
  {
    path: "/customers",
    icon: Users,
    label: { en: "Customers", ar: "العملاء" },
    permission: "customers",
  },
  {
    path: "/invoices",
    icon: FileText,
    label: { en: "Invoices", ar: "الفواتير" },
    permission: "invoices",
  },
  {
    path: "/inventory",
    icon: Package,
    label: { en: "Inventory", ar: "المخزون" },
    permission: "inventory",
  },
  {
    path: "/employees",
    icon: UserCheck,
    label: { en: "Employees & Tasks", ar: "الموظفين والمهام" },
    permission: "employees",
  },
  {
    path: "/notifications",
    icon: Bell,
    label: { en: "Smart Notifications", ar: "الإشعارات الذكية" },
    permission: "notifications",
  },
  {
    path: "/financial",
    icon: TrendingUp,
    label: { en: "Financial Dashboard", ar: "لوحة المالية" },
    permission: "financial",
  },
  {
    path: "/suppliers",
    icon: Building2,
    label: { en: "Supplier Management", ar: "إدارة الموردين" },
    permission: "suppliers",
  },
  {
    path: "/settings",
    icon: Settings,
    label: { en: "Settings", ar: "الإعدادات" },
    permission: "admin",
  },
];

export default function Sidebar({ onItemClick }: SidebarProps) {
  const { hasPermission } = useAuth();
  const { language } = useLanguage();

  const visibleMenuItems = menuItems.filter(
    (item) => item.permission === "*" || hasPermission(item.permission),
  );

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden">
      {/* Logo Section - Compact on mobile */}
      <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`flex items-center ${language === "ar" ? "space-x-reverse space-x-2 sm:space-x-3" : "space-x-2 sm:space-x-3"}`}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-primary to-green-secondary rounded-lg flex items-center justify-center flex-shrink-0">
            <img
              src="/logo.png"
              alt="Company Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain bg-white rounded shadow"
              onError={e => {
                if (e.currentTarget.src.indexOf('logo.png') !== -1) {
                  e.currentTarget.src = '/logo.jpg';
                } else if (e.currentTarget.src.indexOf('logo.jpg') !== -1) {
                  e.currentTarget.src = '/logo';
                } else if (e.currentTarget.src.indexOf('logo') !== -1) {
                  e.currentTarget.src = '/logo.PNG';
                } else {
                  e.currentTarget.src = 'https://via.placeholder.com/40x40?text=Logo';
                }
              }}
            />
          </div>
          <div className={`min-w-0 ${language === "ar" ? "rtl-content" : ""}`}>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              {language === "ar" ? "بورصة هلال" : "Bursa Hilal"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {language === "ar" ? "نظام إدارة المصنع" : "Factory Management"}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Navigation - Optimized scrolling */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
        <div className="p-3 sm:p-4 space-y-1 sm:space-y-2">
          {visibleMenuItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ x: language === "ar" ? 30 : -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ 
                delay: 0.05 * index, 
                duration: 0.3,
                ease: "easeOut"
              }}
            >
              <NavLink
                to={item.path}
                onClick={onItemClick}
                className={({ isActive }) =>
                  `group flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 ease-out touch-manipulation ${
                    isActive
                      ? "bg-gradient-to-r from-green-primary to-green-secondary text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200"
                  } ${language === "ar" ? "space-x-reverse space-x-2 sm:space-x-3" : "space-x-2 sm:space-x-3"}`
                }
              >
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base truncate">
                  {item.label[language]}
                </span>
              </NavLink>
            </motion.div>
          ))}
        </div>
      </nav>

      {/* Footer - Version info */}
      <div className="p-3 sm:p-4 border-t border-gray-200 flex-shrink-0">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
