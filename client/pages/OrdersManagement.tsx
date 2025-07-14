import { useState, useEffect } from "react";
import React, { Component, ReactNode } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import NewOrderModal from "../components/NewOrderModal";
import EditOrderModal from "../components/EditOrderModal";
import ConfirmationModal from "../components/ConfirmationModal";
import apiService from "../services/api";
import { showOrderUpdatedToast, showOrderDeletedToast, showErrorToast } from '../utils/toast';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Package,
  ExternalLink,
} from "lucide-react";

// حالة الطلبات
const orderStatuses = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-800" },
  completed: { label: "Completed", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
};

function StatusBadge({ status, language }: { status: keyof typeof orderStatuses; language: string }) {
  const statusConfig = orderStatuses[status];
  const statusLabels = {
    pending: language === "ar" ? "معلق" : "Pending",
    processing: language === "ar" ? "قيد التنفيذ" : "Processing", 
    completed: language === "ar" ? "مكتمل" : "Completed",
    cancelled: language === "ar" ? "ملغي" : "Cancelled"
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
      {statusLabels[status]}
    </span>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode; language?: string }, { hasError: boolean; error: any }> {
  constructor(props: { children: ReactNode; language?: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error("ErrorBoundary caught an error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-600">
          <h2>{this.props.language === "ar" ? "حدث خطأ في الصفحة" : "An error occurred on this page"}</h2>
          <pre>{this.state.error && this.state.error.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function OrdersManagement() {
  const { language, t } = useLanguage();
  const safeT = (key: string) => {
    try {
      const value = t(key);
      return value || key;
    } catch {
      return key;
    }
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<any>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersData = await apiService.getOrders();
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (error) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        {language === "ar" ? "جاري تحميل الطلبات..." : "Loading orders..."}
      </div>
    );
  }

  // إحصائيات الطلبات
  const totalOrders = orders.length;
  const processingOrders = orders.filter(order => order.status === "processing").length;
  const completedOrders = orders.filter(order => order.status === "completed").length;
  const cancelledOrders = orders.filter(order => order.status === "cancelled").length;

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) || order.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOrderCreated = async () => {
    // إعادة تحميل قائمة الطلبات بعد إنشاء طلب جديد
    try {
      const ordersData = await apiService.getOrders();
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error("خطأ في تحديث قائمة الطلبات:", error);
    }
  };

  const handleSaveOrder = async (updatedOrder: any) => {
    try {
      await apiService.updateOrder(updatedOrder.id, updatedOrder);
      const ordersData = await apiService.getOrders();
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setShowEditModal(false);
      setSelectedOrder(null);
      
      // عرض رسالة نجاح
      showOrderUpdatedToast(language, updatedOrder.id, updatedOrder.customer);
    } catch (error) {
      console.error("خطأ في تحديث الطلب:", error);
      showErrorToast(
        language === "ar" ? "فشل في تحديث الطلب" : "Failed to Update Order",
        language === "ar" ? "حدث خطأ أثناء تحديث الطلب. يرجى المحاولة مرة أخرى" : "An error occurred while updating the order. Please try again"
      );
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      setDeletingOrderId(orderId);
      await apiService.deleteOrder(orderId);
      // تحديث قائمة الطلبات بعد الحذف
      setOrders(orders.filter(order => order.id !== orderId));
      showOrderDeletedToast(language, orderId);
    } catch (error) {
      console.error("Error deleting order:", error);
      showErrorToast(
        language === "ar" ? "فشل في حذف الطلب" : "Failed to Delete Order",
        language === "ar" ? "حدث خطأ أثناء حذف الطلب. يرجى المحاولة مرة أخرى" : "An error occurred while deleting the order. Please try again"
      );
    } finally {
      setDeletingOrderId(null);
    }
  };

  const confirmDeleteOrder = (order: any) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  return (
    <ErrorBoundary language={language}>
      <div className="space-y-6">
        {/* شريط التنقل */}
        <nav className="flex text-sm text-gray-500">
          <span>{safeT("dashboard")}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{safeT("ordersManagement")}</span>
        </nav>
        {/* رأس الصفحة */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{safeT("ordersManagement")}</h1>
            <p className="text-gray-600 mt-1">{safeT("ordersManagementDesc")}</p>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowNewOrderModal(true)} className={`mt-4 sm:mt-0 px-4 py-2 bg-green-primary text-white rounded-lg hover:bg-green-secondary transition-colors flex items-center ${language === "ar" ? "space-x-reverse space-x-2" : "space-x-2"}`}>
            <Plus className="w-4 h-4" />
            <span>{safeT("newOrder")}</span>
          </motion.button>
        </motion.div>
        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[{
            title: language === "ar" ? "إجمالي الطلبات" : "Total Orders",
            value: totalOrders.toString(),
            icon: Package,
            color: "blue",
          }, {
            title: language === "ar" ? "قيد التنفيذ" : "Processing",
            value: processingOrders.toString(),
            icon: Clock,
            color: "yellow",
          }, {
            title: language === "ar" ? "مكتمل" : "Completed",
            value: completedOrders.toString(),
            icon: CheckCircle,
            color: "green",
          }, {
            title: language === "ar" ? "ملغي" : "Cancelled",
            value: cancelledOrders.toString(),
            icon: AlertCircle,
            color: "red",
          }].map((stat, index) => (
            <motion.div key={stat.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {/* البحث والتصفية */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder={language === "ar" ? "بحث عن الطلبات..." : "Search orders..."} 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent w-64" 
                />
              </div>
              <select 
                value={selectedStatus} 
                onChange={e => setSelectedStatus(e.target.value)} 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
              >
                <option value="all">{language === "ar" ? "كل الحالات" : "All Status"}</option>
                <option value="pending">{language === "ar" ? "قيد الانتظار" : "Pending"}</option>
                <option value="processing">{language === "ar" ? "قيد التنفيذ" : "Processing"}</option>
                <option value="completed">{language === "ar" ? "مكتمل" : "Completed"}</option>
                <option value="cancelled">{language === "ar" ? "ملغي" : "Cancelled"}</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowFilterModal(true)} 
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>{language === "ar" ? "تصفية" : "Filter"}</span>
              </button>
              <button onClick={() => {
                const csvContent = [
                  "Order ID,Customer,Date,Status,Total,Deadline",
                  ...filteredOrders.map(order => `${order.id},${order.customer},${order.date},${order.status},${order.total},${order.deadline}`),
                ].join("\n");
                const blob = new Blob([csvContent], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `orders_export_${new Date().toISOString().split("T")[0]}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
              }} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>{language === "ar" ? "تصدير" : "Export"}</span>
              </button>
            </div>
          </div>
        </motion.div>
        {/* جدول الطلبات */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === "ar" ? "رقم الطلب" : "Order ID"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === "ar" ? "العميل" : "Customer"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === "ar" ? "التاريخ" : "Date"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === "ar" ? "الحالة" : "Status"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === "ar" ? "الإجمالي" : "Total"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === "ar" ? "الموعد النهائي" : "Deadline"}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider actions-column">
                    {language === "ar" ? "إجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order, index) => (
                  <motion.tr key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-primary to-green-secondary rounded-full flex items-center justify-center mr-3">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {order.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status as keyof typeof orderStatuses} language={language} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ${order.total?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.deadline}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center actions-column">
                      <div className="action-buttons">
                        <Link 
                          to={`/track-order/${order.id}/details`} 
                          className="text-green-primary hover:text-green-secondary p-1 rounded transition-colors inline-flex items-center" 
                          title={language === "ar" ? "متابعة الطلب" : "Track Order"}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => { setSelectedOrder(order); setShowEditModal(true); }} 
                          className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors" 
                          title={language === "ar" ? "تعديل الطلب" : "Edit Order"}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => confirmDeleteOrder(order)} 
                          disabled={deletingOrderId === order.id}
                          className={`p-1 rounded transition-colors ${
                            deletingOrderId === order.id 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-red-600 hover:text-red-800'
                          }`}
                          title={language === "ar" ? "حذف الطلب" : "Delete Order"}
                        >
                          {deletingOrderId === order.id ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
        {/* ملاحظات المسؤول */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            {language === "ar" ? "ملاحظات المسؤول" : "Admin Notes"}
          </h3>
          <textarea 
            placeholder={language === "ar" ? "أضف ملاحظات تظهر فقط للمسؤولين..." : "Add notes that only admins can see..."} 
            className="w-full h-24 p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none bg-white" 
          />
          <button className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
            {language === "ar" ? "حفظ الملاحظات" : "Save Notes"}
          </button>
        </motion.div>
        {/* نافذة التصفية */}
        {showFilterModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowFilterModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === "ar" ? "تصفية متقدمة" : "Advanced Filter"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "ar" ? "نطاق التاريخ" : "Date Range"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent" />
                    <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "ar" ? "نطاق المبلغ" : "Amount Range"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="number" 
                      placeholder={language === "ar" ? "الحد الأدنى" : "Min Amount"} 
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent" 
                    />
                    <input 
                      type="number" 
                      placeholder={language === "ar" ? "الحد الأعلى" : "Max Amount"} 
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "ar" ? "العميل" : "Customer"}
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent">
                    <option value="">{language === "ar" ? "كل العملاء" : "All Customers"}</option>
                    <option value="Libya Textile Co.">Libya Textile Co.</option>
                    <option value="Ahmed Textiles Ltd.">Ahmed Textiles Ltd.</option>
                    <option value="Cairo Fashion House">Cairo Fashion House</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button 
                  onClick={() => setShowFilterModal(false)} 
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {language === "ar" ? "تطبيق التصفية" : "Apply Filter"}
                </button>
                <button 
                  onClick={() => setShowFilterModal(false)} 
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {/* نافذة إضافة طلب جديد */}
        <NewOrderModal isOpen={showNewOrderModal} onClose={() => setShowNewOrderModal(false)} onOrderCreated={handleOrderCreated} />
        {/* نافذة تعديل الطلب */}
        <EditOrderModal order={selectedOrder} isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedOrder(null); }} onSave={handleSaveOrder} />
        
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setOrderToDelete(null);
          }}
          onConfirm={() => orderToDelete && handleDeleteOrder(orderToDelete.id)}
          title={language === "ar" ? "تأكيد حذف الطلب" : "Confirm Order Deletion"}
          message={language === "ar" 
            ? "هل أنت متأكد من أنك تريد حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
            : "Are you sure you want to delete this order? This action cannot be undone."
          }
          confirmText={language === "ar" ? "حذف الطلب" : "Delete Order"}
          cancelText={language === "ar" ? "إلغاء" : "Cancel"}
          type="danger"
          itemName={orderToDelete ? `${language === "ar" ? "طلب رقم" : "Order"} #${orderToDelete.id} - ${orderToDelete.customer}` : ""}
        />
      </div>
    </ErrorBoundary>
  );
}
