import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import AnimatedCounter from "../components/AnimatedCounter";
import { cardHover, staggerContainer, staggerItem } from "../utils/animations";
import apiService from "../services/api";
import {
  Package,
  Palette,
  Scissors,
  Shield,
  PlayCircle,
  Truck,
  CheckCircle,
  Clock,
  Calendar,
  User,
  DollarSign,
  Eye,
  Search,
  Filter,
} from "lucide-react";



interface TimelineStep {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  current?: boolean;
  notes?: string;
  icon: any;
  color: string;
}

interface OrderCard {
  id: string;
  customer: string;
  product: string;
  quantity: string;
  colors: string;
  date: string;
  total: number;
  depositPaid: number;
  remaining: number;
  status: string;
  currentStage: string;
  progress: number;
}

// Helper functions for stage management

const getStageIcon = (stage: string) => {
  const stageIcons: { [key: string]: any } = {
    "Order Received": Package,
    "Sent to Dyeing": Palette,
    "Back from Dyeing": CheckCircle,
    "Sent to Stitching": Scissors,
    "Quality Check": Shield,
    "Ready for Delivery": PlayCircle,
    Delivered: Truck,
  };
  return stageIcons[stage] || Package;
};

const getStageColor = (stage: string) => {
  const stageColors: { [key: string]: string } = {
    "Order Received": "bg-blue-500",
    "Sent to Dyeing": "bg-purple-500",
    "Back from Dyeing": "bg-green-500",
    "Sent to Stitching": "bg-orange-500",
    "Quality Check": "bg-yellow-500",
    "Ready for Delivery": "bg-indigo-500",
    Delivered: "bg-gray-500",
  };
  return stageColors[stage] || "bg-blue-500";
};

function OrderCard({ order }: { order: OrderCard }) {
  const { language } = useLanguage();
  const StageIcon = getStageIcon(order.currentStage);
  const stageColor = getStageColor(order.currentStage);

  return (
    <motion.div
      variants={staggerItem}
      className="mobile-card rounded-xl overflow-hidden will-change-transform hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-white border border-gray-200"
      style={{
        touchAction: "manipulation",
      }}
    >
      {/* Make the entire card clickable */}
      <Link 
        to={`/track-order/${order.id}/details`} 
        className="block hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
      >
        {/* Header */}
        <div
          className={`p-4 ${order.status === "completed" ? "bg-green-50" : order.status === "pending" ? "bg-yellow-50" : "bg-blue-50"}`}
        >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{order.customer}</h3>
            <p className="text-sm text-gray-600">{order.id}</p>
          </div>
          <div className={`p-2 rounded-lg ${stageColor} text-white`}>
            <StageIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Product Info */}
        <div>
          <h4 className="font-medium text-gray-900 mb-1">{order.product}</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              {order.quantity}
            </p>
            <p>
              {language === "ar" ? "الألوان" : "Colors"}: {order.colors}
            </p>
            <p className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {order.date}
            </p>
          </div>
        </div>

        {/* Current Stage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              {language === "ar" ? "المرحلة الحالية" : "Current Stage"}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                order.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : order.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
              }`}
            >
              {order.currentStage}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${order.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-green-primary to-green-secondary h-2 rounded-full"
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {order.progress}% {language === "ar" ? "مكتمل" : "complete"}
          </p>
        </div>
      </div>
      </Link>

      {/* Actions - Outside of the main link to avoid nesting issues */}
      <div className="p-4 pt-0">
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <Link
            to={`/track-order/${order.id}/details`}
            className="flex items-center space-x-2 rtl:space-x-reverse text-green-primary hover:text-green-secondary text-sm font-medium transition-colors hover:bg-green-50 px-2 py-1 rounded-md"
            onClick={(e) => e.stopPropagation()} // Prevent card click when clicking button
          >
            <Eye className="w-4 h-4" />
            <span>{language === "ar" ? "عرض التفاصيل" : "View Details"}</span>
          </Link>
          <span className="text-xs text-gray-500">
            {language === "ar" ? "تم التحديث اليوم" : "Updated today"}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default function TrackOrder() {
  const { language, t } = useLanguage();
  const [orders, setOrders] = useState<OrderCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await apiService.getOrders();
      
      // Transform API data to match OrderCard interface
      const transformedOrders = ordersData.map((order: any) => ({
        id: order.id,
        customer: order.customer,
        product: order.product,
        quantity: order.quantity,
        colors: order.colors,
        date: order.date,
        total: order.total,
        depositPaid: order.depositPaid || 0,
        remaining: order.remaining || order.total,
        status: order.status || "pending",
        currentStage: order.currentStage || "Order Received",
        progress: calculateProgress(order),
      }));
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (order: any) => {
    if (order.status === "completed") return 100;
    
    // Use completedStages array if available, fallback to currentStage
    if (order.completedStages && Array.isArray(order.completedStages)) {
      const totalStages = 7; // Total number of stages
      const completedCount = order.completedStages.length;
      return Math.round((completedCount / totalStages) * 100);
    }
    
    // Fallback to old method
    const stages = [
      "Order Received",
      "Sent to Dyeing", 
      "Back from Dyeing",
      "Sent to Stitching",
      "Quality Check",
      "Ready for Delivery",
      "Delivered"
    ];
    
    const stageIndex = stages.indexOf(order.currentStage || "Order Received");
    return stageIndex >= 0 ? Math.round(((stageIndex + 1) / stages.length) * 100) : 14;
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Breadcrumb */}
      <nav className="flex text-sm text-gray-500">
        <Link to="/" className="hover:text-gray-700">
          {t("dashboard")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{t("trackOrder")}</span>
      </nav>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("trackOrders")}
          </h1>
          <p className="text-gray-600 mt-1">{t("monitorActiveOrders")}</p>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="responsive-grid container-safe">
        {[
          {
            label: language === "ar" ? "إجمالي الطلبات" : "Total Orders",
            value: orders.length,
            color: "blue",
          },
          {
            label: language === "ar" ? "قيد التنفيذ" : "In Progress",
            value: orders.filter((o) => o.status === "processing").length,
            color: "yellow",
          },
          {
            label: language === "ar" ? "مكتمل" : "Completed",
            value: orders.filter((o) => o.status === "completed").length,
            color: "green",
          },
          {
            label: language === "ar" ? "معلق" : "Pending",
            value: orders.filter((o) => o.status === "pending").length,
            color: "red",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  <AnimatedCounter value={stat.value} />
                </p>
              </div>
              <div
                className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}
              >
                <Package className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={
                  language === "ar" ? "بحث عن الطلبات..." : "Search orders..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
            >
              <option value="all">{t("allStatus")}</option>
              <option value="pending">{t("pending")}</option>
              <option value="processing">{t("processing")}</option>
              <option value="completed">{t("completed")}</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            {language === "ar"
              ? `عرض ${filteredOrders.length} من ${orders.length} طلبات`
              : `Showing ${filteredOrders.length} of ${orders.length} orders`}
          </div>
        </div>
      </motion.div>

      {/* Orders Grid */}
      <div className="responsive-grid container-safe">
        {filteredOrders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <OrderCard order={order} />
          </motion.div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {language === "ar" ? "لم يتم العثور على طلبات" : "No orders found"}
          </h3>
          <p className="text-gray-600">
            {language === "ar"
              ? "حاول تعديل معايير البحث أو التصفية."
              : "Try adjusting your search or filter criteria."}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
