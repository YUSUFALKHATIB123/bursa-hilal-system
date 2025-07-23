import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import apiService from "../services/api";
import { logMobileConnectionInfo, isMobileDevice } from "../utils/mobileConnection";
import { verifyDataConsistency } from "../utils/dataConsistency";
import {
  ShoppingCart,
  Users,
  Package,
  UserCheck,
  Bell,
  TrendingUp,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Target,
  Activity,
} from "lucide-react";

function AnimatedCounter({
  value,
  duration = 2000,
  suffix = "",
  prefix = "",
}: {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function RoleBasedCard({
  title,
  description,
  icon: Icon,
  value,
  color,
  trend,
  prefix = "",
  suffix = "",
}: {
  title: string;
  description: string;
  icon: any;
  value: string | number;
  color: string;
  trend?: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all duration-200 touch-manipulation"
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 rounded-lg ${color} flex-shrink-0`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div className="text-right min-w-0">
          <div className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            {typeof value === "number" ? (
              <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
            ) : (
              value
            )}
          </div>
          {trend && (
            <div
              className={`text-xs sm:text-sm ${trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}
            >
              {trend}
            </div>
          )}
        </div>
      </div>
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export default function Index() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  
  // State for API data
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [invoices, setInvoices] = useState([]);
  type FinancialsType = { revenue?: number };
  const [financials, setFinancials] = useState<FinancialsType>({});
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Log mobile connection info for debugging
        if (isMobileDevice()) {
          logMobileConnectionInfo();
        }
        
        console.log('Fetching dashboard data...'); // Debug log
        const [ordersData, inventoryData, notificationsData, invoicesData, financialsData, employeesData] = await Promise.all([
          apiService.getOrders(),
          apiService.getInventory(),
          apiService.getNotifications(),
          apiService.getInvoices(),
          apiService.getFinancials(),
          apiService.getEmployees()
        ]);
        
        console.log('Dashboard data received:', {
          orders: ordersData?.length,
          inventory: inventoryData?.length,
          notifications: notificationsData?.length,
          invoices: invoicesData?.length,
          financials: Object.keys(financialsData || {}).length,
          employees: employeesData?.length
        }); // Debug log
        
        setOrders(ordersData || []);
        setInventory(inventoryData || []);
        setNotifications(notificationsData || []);
        setInvoices(invoicesData || []);
        setFinancials(financialsData || {});
        setEmployees(employeesData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // More detailed error handling for mobile
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
          console.error('Network connection issue detected - this often happens on mobile devices');
        }
        
        // Set fallback empty data
        setOrders([]);
        setInventory([]);
        setNotifications([]);
        setInvoices([]);
        setFinancials({});
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  // Calculate real-time stats from API data using same method as FinancialDashboard
  const todayOrders = orders.filter(
    (order) => order.date === "2025-01-15",
  ).length;

  const processingOrders = orders.filter(
    (order) => order.status === "processing",
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "completed",
  ).length;

  const lowStockItems = inventory.filter(
    (item) => item.quantity < 1000,
  ).length;

  const activeAlerts = notifications.filter(
    (notif) => notif.priority === "high",
  ).length;

  // Calculate revenue from invoices - same method as FinancialDashboard
  const totalRevenue = invoices.reduce((sum, inv) => {
    const amount = inv.amountReceived || inv.amount || inv.total || 0;
    return sum + (typeof amount === 'number' ? amount : 0);
  }, 0);

  const pendingPayments = orders
    .filter((order) => order.status !== "completed")
    .reduce((sum, order) => sum + order.total, 0);

  const unpaidSalaries = employees.reduce(
    (sum, emp) => sum + (emp.salary - emp.paid),
    0,
  );

  // Role-based dashboard content
  const getDashboardContent = () => {
    switch (user?.role) {
      case "admin":
      case "owner":
        return [
          {
            title: language === "ar" ? "إجمالي الطلبات" : "Total Orders",
            description:
              language === "ar"
                ? "جميع الطلبات في النظام"
                : "All orders in system",
            icon: ShoppingCart,
            value: orders.length,
            color: "bg-blue-500",
            trend: "+12%",
          },
          {
            title: language === "ar" ? "إجمالي الإيرادات" : "Total Revenue",
            description:
              language === "ar" ? "الإيرادات الشهرية" : "Monthly revenue",
            icon: DollarSign,
            value: Math.round(totalRevenue / 1000 * 10) / 10,
            prefix: "$",
            suffix: "K",
            color: "bg-green-500",
            trend: "+18%",
          },
          {
            title: language === "ar" ? "المخزون المنخفض" : "Low Stock Items",
            description:
              language === "ar"
                ? "عناصر تحتاج إعادة تموين"
                : "Items need restocking",
            icon: AlertTriangle,
            value: lowStockItems,
            color: "bg-orange-500",
            trend: lowStockItems > 0 ? (language === "ar" ? "تنبيه" : "Alert") : (language === "ar" ? "جيد" : "Good"),
          },
          {
            title: language === "ar" ? "التنبيهات النشطة" : "Active Alerts",
            description:
              language === "ar"
                ? "تنبيهات عالية الأولوية"
                : "High priority alerts",
            icon: Bell,
            value: activeAlerts,
            color: "bg-red-500",
            trend: activeAlerts > 0 ? (language === "ar" ? "بحاجة إجراء" : "Action needed") : (language === "ar" ? "كل شيء جيد" : "All clear"),
          },
          {
            title:
              language === "ar" ? "الطلبات قيد التنفيذ" : "Processing Orders",
            description:
              language === "ar"
                ? "طلبات في مراحل الإنتاج"
                : "Orders in production",
            icon: Clock,
            value: processingOrders,
            color: "bg-purple-500",
            trend: "+5%",
          },
          {
            title: language === "ar" ? "الموظفون النشطون" : "Active Employees",
            description:
              language === "ar"
                ? "موظفون في العمل اليوم"
                : "Employees working today",
            icon: UserCheck,
            value: employees.length,
            color: "bg-indigo-500",
            trend: "100%",
          },
        ];

      case "accountant":
        return [
          {
            title: language === "ar" ? "إجمالي الإيرادات" : "Total Revenue",
            description:
              language === "ar" ? "الإيرادات الشهرية" : "Monthly revenue",
            icon: DollarSign,
            value: Math.round(totalRevenue / 1000 * 10) / 10,
            prefix: "$",
            suffix: "K",
            color: "bg-green-500",
            trend: "+18%",
          },
          {
            title: language === "ar" ? "المدفوعات المعلقة" : "Pending Payments",
            description:
              language === "ar"
                ? "مدفوعات في انتظار التحصيل"
                : "Payments awaiting collection",
            icon: Clock,
            value: `$${(pendingPayments / 1000).toFixed(1)}K`,
            color: "bg-orange-500",
            trend: "Due",
          },
          {
            title: language === "ar" ? "الفواتير اليوم" : "Today's Invoices",
            description:
              language === "ar"
                ? "فواتير مُصدرة اليوم"
                : "Invoices issued today",
            icon: FileText,
            value: 3,
            color: "bg-blue-500",
            trend: "+2",
          },
          {
            title: language === "ar" ? "رواتب معلقة" : "Unpaid Salaries",
            description:
              language === "ar"
                ? "مبالغ رواتب غير مدفوعة"
                : "Outstanding salary amounts",
            icon: AlertTriangle,
            value: `$${(unpaidSalaries / 1000).toFixed(1)}K`,
            color: "bg-red-500",
            trend: "Pay due",
          },
        ];

      case "production":
        return [
          {
            title:
              language === "ar" ? "طلبات للإنتاج" : "Orders for Production",
            description:
              language === "ar" ? "طلبات جاهزة للبدء" : "Orders ready to start",
            icon: Target,
            value: processingOrders,
            color: "bg-blue-500",
            trend: "Priority",
          },
          {
            title: language === "ar" ? "مراحل الإنتاج" : "Production Stages",
            description:
              language === "ar"
                ? "مراحل نشطة حاليًا"
                : "Currently active stages",
            icon: Activity,
            value: 8,
            color: "bg-purple-500",
            trend: "Active",
          },
          {
            title: language === "ar" ? "المخزون المطلوب" : "Required Stock",
            description:
              language === "ar" ? "مواد خام مطلوبة" : "Raw materials needed",
            icon: Package,
            value: 5,
            color: "bg-orange-500",
            trend: "Check",
          },
          {
            title: language === "ar" ? "معدات الإنتاج" : "Production Equipment",
            description:
              language === "ar"
                ? "معدات جاهزة للعمل"
                : "Equipment ready for work",
            icon: CheckCircle,
            value: 12,
            color: "bg-green-500",
            trend: "Ready",
          },
        ];

      default:
        return [
          {
            title: language === "ar" ? "المهام اليوم" : "Today's Tasks",
            description:
              language === "ar"
                ? "مهام مُحددة لك اليوم"
                : "Tasks assigned to you today",
            icon: CheckCircle,
            value: 4,
            color: "bg-blue-500",
            trend: "2 completed",
          },
          {
            title: language === "ar" ? "الإنجاز الأسبوعي" : "Weekly Progress",
            description:
              language === "ar"
                ? "نسبة إنجاز المهام هذا الأسبوع"
                : "Task completion rate this week",
            icon: TrendingUp,
            value: "87%",
            color: "bg-green-500",
            trend: "+5%",
          },
        ];
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 max-w-full overflow-hidden">
      {/* Header - Mobile optimized */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-primary to-green-secondary text-white rounded-lg sm:rounded-2xl p-4 sm:p-6 lg:p-8 overflow-hidden"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 truncate">
          {`${t("welcome")} ${user?.name.split(" ")[0]}`}
        </h1>
        <p className="text-green-100 text-sm sm:text-base lg:text-lg line-clamp-2">
          {language === "ar"
            ? `لوحة التحكم الذكية - ${user?.role === "admin" ? "مدير النظام" : user?.role === "owner" ? "مالك الشركة" : user?.role === "accountant" ? "محاسب" : user?.role === "production" ? "مدير الإنتاج" : "مساعد مدير"}`
            : `Smart Dashboard - ${user?.role === "admin" ? "System Administrator" : user?.role === "owner" ? "Company Owner" : user?.role === "accountant" ? "Accountant" : user?.role === "production" ? "Production Manager" : "Assistant Manager"}`}
        </p>
        <div
          className={`mt-3 sm:mt-4 flex items-center ${language === "ar" ? "space-x-reverse space-x-2" : "space-x-2"} text-green-100`}
        >
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="text-xs sm:text-sm truncate">
            {new Date().toLocaleDateString(
              language === "ar" ? "ar-EG" : "en-US",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              },
            )}
          </span>
        </div>
      </motion.div>

      {/* Role-based Dashboard Cards - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {getDashboardContent().map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <RoleBasedCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Today's Overview - Mobile optimized */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 overflow-hidden"
      >
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 truncate">
          {t("todaysOverview")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">
              <AnimatedCounter value={todayOrders} />
            </div>
            <p className="text-blue-800 font-medium text-xs sm:text-sm truncate">{t("newOrders")}</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
              <AnimatedCounter value={completedOrders} />
            </div>
            <p className="text-green-800 font-medium text-xs sm:text-sm truncate">
              {t("completed")} {t("ordersManagement")}
            </p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1 sm:mb-2">
              <AnimatedCounter value={activeAlerts} />
            </div>
            <p className="text-orange-800 font-medium text-xs sm:text-sm truncate">{t("activeAlerts")}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}