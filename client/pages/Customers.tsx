import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import AddCustomerModal from "../components/AddCustomerModal";
import EditCustomerModal from "../components/EditCustomerModal";
import apiService from "../services/api";
import { toast } from 'react-toastify';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  X,
  DollarSign,
  Package,
  Calendar,
  User,
  Building,
  CreditCard,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalRevenue: number;
  lastOrderDate: string;
  customerType: string;
  company?: string;
  outstanding?: number;
  paid?: number;
}

interface Order {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: string;
  deadline?: string;
}

interface Invoice {
  id: string;
  customer: string;
  date: string;
  total: number;
  amountReceived: number;
  amountRemaining: number;
  paymentStatus: string;
}

export default function Customers() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [customersData, ordersData, invoicesData] = await Promise.all([
        apiService.getCustomers(),
        apiService.getOrders(),
        apiService.getInvoices()
      ]);
      setCustomers(Array.isArray(customersData) ? customersData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setCustomers([]);
      setOrders([]);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const getCustomerOrders = (customerName: string) => {
    return orders.filter(order => 
      order.customer.toLowerCase() === customerName.toLowerCase()
    );
  };

  const getCustomerInvoices = (customerName: string) => {
    return invoices.filter(invoice => 
      invoice.customer.toLowerCase() === customerName.toLowerCase()
    );
  };

  const getCustomerStats = (customer: Customer) => {
    const customerOrders = getCustomerOrders(customer.name);
    const customerInvoices = getCustomerInvoices(customer.name);
    // حساب القيم المالية بدقة حسب حالة الدفع
    let totalRevenue = 0;
    let totalPaid = 0;
    let outstanding = 0;
    customerInvoices.forEach(inv => {
      const total = inv.total || inv.amount || 0;
      if (inv.paymentStatus === 'paid') {
        totalRevenue += total;
        totalPaid += total;
      } else if (inv.paymentStatus === 'unpaid') {
        totalRevenue += total;
        outstanding += total;
      } else if (inv.paymentStatus === 'partial') {
        totalRevenue += total;
        if (typeof inv.amountReceived === 'number') {
          totalPaid += inv.amountReceived;
          outstanding += total - inv.amountReceived;
        } else {
          // إذا لم يوجد amountReceived، اعتبر المدفوع = 0 والمتبقي = total
          outstanding += total;
        }
      }
    });
    const paymentPercentage = totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0;
    return {
      orderCount: customerOrders.length,
      totalRevenue,
      totalPaid,
      outstanding,
      paymentPercentage,
      orders: customerOrders,
      invoices: customerInvoices
    };
  };

  const handleEditCustomer = (customer: Customer) => {
    // Map the customer data to match EditCustomerModal's interface
    const editableCustomer = {
      id: customer.id,
      name: customer.name,
      company: customer.company || "", // Default to empty string if not provided
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: "", // Extract from address if needed
      country: "", // Extract from address if needed
      orders: customer.totalOrders,
      totalSpent: customer.totalRevenue,
      status: "active" // Default status
    };
    
    setEditingCustomer(editableCustomer);
    setShowEditModal(true);
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (window.confirm(language === "ar" 
      ? `هل أنت متأكد من حذف العميل "${customer.name}"؟` 
      : `Are you sure you want to delete customer "${customer.name}"?`
    )) {
      try {
        // Here you would typically call the API to delete the customer
        // For now, we'll update the local state
        setCustomers(customers.filter(c => c.id !== customer.id));
        
        const successMessage = language === "ar"
          ? "تم حذف العميل بنجاح"
          : "Customer deleted successfully";
        toast.success(successMessage, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (error) {
        console.error("Error deleting customer:", error);
        const errorMessage = language === "ar"
          ? "حدث خطأ أثناء حذف العميل"
          : "An error occurred while deleting the customer";
        toast.error(errorMessage, {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const handleSaveCustomer = async (updatedCustomer: any) => {
    try {
      // Map the edited customer data back to the original Customer interface
      const mappedCustomer: Customer = {
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        address: updatedCustomer.address || "",
        totalOrders: updatedCustomer.orders || 0,
        totalRevenue: updatedCustomer.totalSpent || 0,
        lastOrderDate: "", // Keep original value
        customerType: "premium", // Keep original value or determine based on data
        company: updatedCustomer.company,
        outstanding: 0, // Calculate if needed
        paid: 0 // Calculate if needed
      };

      // Here you would typically call the API to update the customer
      // For now, we'll update the local state
      setCustomers(customers.map(c => 
        c.id === mappedCustomer.id ? { ...c, ...mappedCustomer } : c
      ));
      setShowEditModal(false);
      setEditingCustomer(null);
      
      // Show success message
      const successMessage = language === "ar"
        ? "تم تحديث بيانات العميل بنجاح"
        : "Customer information updated successfully";
      toast.success(successMessage, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Error updating customer:", error);
      const errorMessage = language === "ar"
        ? "حدث خطأ أثناء تحديث بيانات العميل"
        : "An error occurred while updating customer information";
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const CustomerCard = ({ customer }: { customer: Customer }) => {
    const stats = getCustomerStats(customer);
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -4, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
        className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:border-green-primary"
        onClick={() => setSelectedCustomer(customer)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-green-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${
                customer.customerType === 'premium' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {customer.customerType === 'premium' 
                  ? (language === "ar" ? 'مميز' : 'Premium')
                  : (language === "ar" ? 'عادي' : 'Regular')
                }
              </span>
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditCustomer(customer);
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title={language === "ar" ? "تعديل" : "Edit"}
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCustomer(customer);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title={language === "ar" ? "حذف" : "Delete"}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <span>{customer.phone}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{customer.address}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="text-sm">
              <span className="text-gray-500">
                {language === "ar" ? "المتبقي: " : "Outstanding: "}
              </span>
              <span className="font-semibold text-red-600">
                ${stats.outstanding.toLocaleString()}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">
                {language === "ar" ? "الطلبات: " : "Orders: "}
              </span>
              <span className="font-semibold text-green-600">{stats.orderCount}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const CustomerModal = ({ customer, onClose }: { customer: Customer; onClose: () => void }) => {
    const stats = getCustomerStats(customer);
    const [tab, setTab] = useState<'info' | 'finance' | 'orders'>('info');
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
                <p className="text-gray-600">{language === "ar" ? "تفاصيل العميل" : "Customer Details"}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => { handleEditCustomer(customer); onClose(); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={language === "ar" ? "تعديل" : "Edit"}><Edit className="w-5 h-5" /></button>
                <button onClick={() => { handleDeleteCustomer(customer); onClose(); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title={language === "ar" ? "حذف" : "Delete"}><Trash2 className="w-5 h-5" /></button>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
              </div>
            </div>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-6">
              <button className={`py-2 px-4 -mb-px border-b-2 ${tab === 'info' ? 'border-green-600 text-green-700 font-bold' : 'border-transparent text-gray-500'}`} onClick={() => setTab('info')}>{language === 'ar' ? 'معلومات العميل' : 'Customer Info'}</button>
              <button className={`py-2 px-4 -mb-px border-b-2 ${tab === 'finance' ? 'border-green-600 text-green-700 font-bold' : 'border-transparent text-gray-500'}`} onClick={() => setTab('finance')}>{language === 'ar' ? 'المعلومات المالية' : 'Financial Info'}</button>
              <button className={`py-2 px-4 -mb-px border-b-2 ${tab === 'orders' ? 'border-green-600 text-green-700 font-bold' : 'border-transparent text-gray-500'}`} onClick={() => setTab('orders')}>{language === 'ar' ? 'سجل الطلبات' : 'Order History'}</button>
            </div>
            <div className="p-6">
              {tab === 'info' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3"><User className="w-5 h-5 text-gray-400" /><div><p className="text-sm text-gray-600">{language === "ar" ? "الاسم الكامل" : "Full Name"}</p><p className="font-medium">{customer.name}</p></div></div>
                  <div className="flex items-center space-x-3"><span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${customer.customerType === 'premium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>★</span><div><p className="text-sm text-gray-600">{language === "ar" ? "نوع العميل" : "Customer Type"}</p><p className="font-medium">{customer.customerType === 'premium' ? (language === "ar" ? 'عميل مميز' : 'Premium Customer') : (language === "ar" ? 'عميل عادي' : 'Regular Customer')}</p></div></div>
                  <div className="flex items-center space-x-3"><Phone className="w-5 h-5 text-gray-400" /><div><p className="text-sm text-gray-600">{language === "ar" ? "رقم الهاتف" : "Phone Number"}</p><p className="font-medium">{customer.phone}</p></div></div>
                  <div className="flex items-center space-x-3"><MapPin className="w-5 h-5 text-gray-400" /><div><p className="text-sm text-gray-600">{language === "ar" ? "الدولة" : "Address"}</p><p className="font-medium">{customer.address}</p></div></div>
                  <div className="flex items-center space-x-3"><Mail className="w-5 h-5 text-gray-400" /><div><p className="text-sm text-gray-600">{language === "ar" ? "الإيميل" : "Email"}</p><p className="font-medium">{customer.email}</p></div></div>
                  {customer.company && (<div className="flex items-center space-x-3"><Building className="w-5 h-5 text-gray-400" /><div><p className="text-sm text-gray-600">{language === "ar" ? "اسم الشركة" : "Company Name"}</p><p className="font-medium">{customer.company}</p></div></div>)}
                </div>
              )}
              {tab === 'finance' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between"><span className="text-sm text-blue-600">{language === "ar" ? "عدد الطلبات" : "Order Count"}</span><span className="text-2xl font-bold text-blue-700"><AnimatedCounter value={stats.orderCount} /></span></div>
                  <div className="bg-green-50 rounded-lg p-4 flex items-center justify-between"><span className="text-sm text-green-600">{language === "ar" ? "إجمالي الإيرادات" : "Total Revenue"}</span><span className="text-2xl font-bold text-green-700">$<AnimatedCounter value={stats.totalRevenue} /></span></div>
                  <div className="bg-emerald-50 rounded-lg p-4 flex items-center justify-between"><span className="text-sm text-emerald-600">{language === "ar" ? "المدفوع" : "Paid"}</span><span className="text-2xl font-bold text-emerald-700">$<AnimatedCounter value={stats.totalPaid} /></span></div>
                  <div className="bg-red-50 rounded-lg p-4 flex items-center justify-between"><span className="text-sm text-red-600">{language === "ar" ? "المتبقي" : "Outstanding"}</span><span className="text-2xl font-bold text-red-700">$<AnimatedCounter value={stats.outstanding} /></span></div>
                  <div className="bg-gray-50 rounded-lg p-4"><div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-600">{language === "ar" ? "نسبة الدفع" : "Payment Ratio"}</span><span className="text-lg font-bold text-gray-700"><AnimatedCounter value={stats.paymentPercentage} />%</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${stats.paymentPercentage}%` }} /></div></div>
                </div>
              )}
              {tab === 'orders' && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {stats.orders.length > 0 ? (
                    stats.orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/orders/${order.id}`)}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-blue-700 underline">{order.id}</p>
                            <p className="text-sm text-gray-500">{order.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">${order.total.toLocaleString()}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-800' : order.status === 'processing' ? 'bg-blue-100 text-blue-800' : order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.status === 'completed' ? (language === "ar" ? 'مكتمل' : 'Completed') : order.status === 'processing' ? (language === "ar" ? 'قيد التنفيذ' : 'Processing') : order.status === 'cancelled' ? (language === "ar" ? 'ملغي' : 'Cancelled') : (language === "ar" ? 'معلق' : 'Pending')}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500"><Package className="w-12 h-12 mx-auto mb-2 text-gray-300" /><p>{language === "ar" ? "لا توجد طلبات لهذا العميل" : "No orders for this customer"}</p></div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex text-sm text-gray-500">
        <span>{t("dashboard")}</span>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{t("customers")}</span>
      </nav>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("customers")}</h1>
          <p className="text-gray-600 mt-1">
            {language === "ar" ? "إدارة وعرض معلومات العملاء" : "Manage and view customer information"}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddCustomerModal(true)}
          className="mt-4 sm:mt-0 px-4 py-2 bg-green-primary text-white rounded-lg hover:bg-green-secondary transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t("addCustomer")}</span>
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-500" />
            <div className="mr-4">
              <p className="text-2xl font-bold text-gray-900">
                <AnimatedCounter value={customers.length} />
              </p>
              <p className="text-gray-600">
                {language === "ar" ? "إجمالي العملاء" : "Total Customers"}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div className="mr-4">
              <p className="text-2xl font-bold text-gray-900">
                <AnimatedCounter value={customers.filter(c => c.customerType === 'premium').length} />
              </p>
              <p className="text-gray-600">
                {language === "ar" ? "عملاء مميزون" : "Premium Customers"}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-yellow-500" />
            <div className="mr-4">
              <p className="text-2xl font-bold text-gray-900">
                $<AnimatedCounter value={customers.reduce((sum, c) => sum + (c.totalRevenue || 0), 0)} />
              </p>
              <p className="text-gray-600">
                {language === "ar" ? "إجمالي الإيرادات" : "Total Revenue"}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <ShoppingBag className="w-8 h-8 text-purple-500" />
            <div className="mr-4">
              <p className="text-2xl font-bold text-gray-900">
                <AnimatedCounter value={orders.length} />
              </p>
              <p className="text-gray-600">
                {language === "ar" ? "إجمالي الطلبات" : "Total Orders"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={language === "ar" ? "البحث عن العملاء..." : "Search customers..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>{language === "ar" ? "تصفية" : "Filter"}</span>
          </button>
          <button
            onClick={async () => {
              const csvData = `Customer Name,Email,Phone,Total Orders,Revenue
${customers.map(c => `${c.name},${c.email},${c.phone},${c.totalOrders},${c.totalRevenue}`).join('\n')}`;

              const blob = new Blob([csvData], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "customers_export.csv";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>{language === "ar" ? "تصدير" : "Export"}</span>
          </button>
        </div>
      </motion.div>

      {/* Customers Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredCustomers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredCustomers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {language === "ar" ? "لا توجد عملاء" : "No customers found"}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? (language === "ar" ? "لم يتم العثور على عملاء مطابقين للبحث" : "No customers match your search")
              : (language === "ar" ? "ابدأ بإضافة عملاء جدد" : "Start by adding new customers")
            }
          </p>
        </motion.div>
      )}

      {/* Customer Modal */}
      {selectedCustomer && (
        <CustomerModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={showAddCustomerModal}
        onClose={() => {
          setShowAddCustomerModal(false);
        }}
        onCustomerAdded={() => {
          fetchData(); // Refresh data after adding new customer
        }}
      />

      {/* Edit Customer Modal */}
      <EditCustomerModal
        customer={editingCustomer}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCustomer(null);
        }}
        onSave={handleSaveCustomer}
      />
    </div>
  );
}
