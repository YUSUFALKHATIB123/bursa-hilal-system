import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNotifications } from "../contexts/NotificationContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Bell,
  AlertCircle,
  CheckCircle2,
  X,
  Calendar,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  Clock,
  User,
} from "lucide-react";

// Animated Counter Component
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

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

export default function Notifications() {
  const { language, t } = useLanguage();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    loading 
  } = useNotifications();
  
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [toastNotifications, setToastNotifications] = useState<ToastNotification[]>([]);

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread" && notification.read) return false;
    if (filter === "read" && !notification.read) return false;
    if (categoryFilter !== "all" && notification.category !== categoryFilter) return false;
    return true;
  });

  // Calculate stats
  const totalNotifications = notifications.length;
  const highPriorityCount = notifications.filter(
    (n) => n.priority === "high" && !n.read
  ).length;
  const todayCount = notifications.filter((n) => {
    const today = new Date();
    const notifDate = new Date(n.timestamp);
    return notifDate.toDateString() === today.toDateString();
  }).length;

  const addToastNotification = (notification: ToastNotification) => {
    setToastNotifications((prev) => [...prev, notification]);
  };

  const removeToastNotification = (id: string) => {
    setToastNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      addToastNotification({
        id: Date.now().toString(),
        title: "Success",
        message: "Notification marked as read",
        type: "success",
      });
    } catch (error) {
      addToastNotification({
        id: Date.now().toString(),
        title: "Error",
        message: "Failed to mark notification as read",
        type: "error",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      addToastNotification({
        id: Date.now().toString(),
        title: "Success",
        message: "All notifications marked as read",
        type: "success",
      });
    } catch (error) {
      addToastNotification({
        id: Date.now().toString(),
        title: "Error",
        message: "Failed to mark all notifications as read",
        type: "error",
      });
    }
  };

  const getNotificationIcon = (type: string): string => {
    const icons = {
      'invoice_created': '📄',
      'invoice_due': '⚠️',
      'order_created': '📦',
      'order_update': '🔄',
      'payment_received': '💰',
      'customer_added': '👤',
      'employee_added': '👥',
      'low_stock': '📉'
    };
    return icons[type as keyof typeof icons] || '📢';
  };

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return language === "ar" ? "الآن" : "now";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return language === "ar" ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return language === "ar" ? `منذ ${hours} ساعة` : `${hours}h ago`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    return language === "ar" ? `منذ ${days} يوم` : `${days}d ago`;
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "financial":
        return "bg-green-100 text-green-800";
      case "inventory":
        return "bg-orange-100 text-orange-800";
      case "production":
        return "bg-blue-100 text-blue-800";
      case "hr":
        return "bg-purple-100 text-purple-800";
      case "sales":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toastNotifications.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`p-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm ${
              toast.type === "success"
                ? "bg-green-50 border border-green-200"
                : toast.type === "error"
                ? "bg-red-50 border border-red-200"
                : toast.type === "warning"
                ? "bg-yellow-50 border border-yellow-200"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            {toast.type === "success" && (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            )}
            {toast.type === "error" && (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            {toast.type === "warning" && (
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            )}
            {toast.type === "info" && (
              <Bell className="w-5 h-5 text-blue-600" />
            )}
            
            <div className="flex-1">
              <p className="font-medium text-sm">{toast.title}</p>
              <p className="text-sm text-gray-600">{toast.message}</p>
            </div>
            
            <button
              onClick={() => removeToastNotification(toast.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Bell className="w-6 h-6 mr-2" />
            {language === "ar" ? "الإشعارات" : "Notifications"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {language === "ar" 
              ? `لديك ${unreadCount} إشعار غير مقروء من أصل ${totalNotifications}`
              : `You have ${unreadCount} unread out of ${totalNotifications} notifications`
            }
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            {language === "ar" ? "قراءة الكل" : "Mark All Read"}
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {language === "ar" ? "إجمالي الإشعارات" : "Total Notifications"}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                <AnimatedCounter value={totalNotifications} />
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {language === "ar" ? "عالية الأولوية" : "High Priority"}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                <AnimatedCounter value={highPriorityCount} />
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {language === "ar" ? "اليوم" : "Today"}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                <AnimatedCounter value={todayCount} />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as "all" | "unread" | "read")}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{language === "ar" ? "الكل" : "All"}</option>
              <option value="unread">{language === "ar" ? "غير مقروء" : "Unread"}</option>
              <option value="read">{language === "ar" ? "مقروء" : "Read"}</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{language === "ar" ? "جميع الفئات" : "All Categories"}</option>
              <option value="financial">{language === "ar" ? "مالي" : "Financial"}</option>
              <option value="inventory">{language === "ar" ? "مخزون" : "Inventory"}</option>
              <option value="production">{language === "ar" ? "إنتاج" : "Production"}</option>
              <option value="hr">{language === "ar" ? "موارد بشرية" : "HR"}</option>
              <option value="sales">{language === "ar" ? "مبيعات" : "Sales"}</option>
            </select>
          </div>
          
          <p className="text-sm text-gray-500">
            {language === "ar" 
              ? `${filteredNotifications.length} إشعار`
              : `${filteredNotifications.length} notifications`
            }
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === "ar" ? "لا توجد إشعارات" : "No notifications"}
            </h3>
            <p className="text-gray-500">
              {language === "ar" 
                ? "لا توجد إشعارات تطابق الفلاتر المحددة"
                : "No notifications match the selected filters"
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white p-6 rounded-lg shadow-sm border-l-4 hover:shadow-md transition-shadow ${
                !notification.read
                  ? notification.priority === "high"
                    ? "border-red-400 bg-red-50"
                    : notification.priority === "medium"
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-blue-400 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {notification.title[language]}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(notification.category)}`}>
                        {notification.category}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">
                      {notification.message[language]}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{getTimeAgo(notification.timestamp)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{notification.userName}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title={language === "ar" ? "تم القراءة" : "Mark as read"}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  
                  {notification.read && (
                    <span className="p-2 text-gray-400">
                      <EyeOff className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
