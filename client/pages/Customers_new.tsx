import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import AddCustomerModal from "../components/AddCustomerModal";
import apiService from "../services/api";
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Phone,
  Mail,
  MapPin,
  Eye,
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

export default function Customers() {
  const { language, t } = useLanguage();
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [customersData, ordersData] = await Promise.all([
        apiService.getCustomers(),
        apiService.getOrders()
      ]);
      setCustomers(Array.isArray(customersData) ? customersData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setCustomers([]);
      setOrders([]);
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

  const getCustomerStats = (customer: Customer) => {
    const customerOrders = getCustomerOrders(customer.name);
    const totalPaid = customer.paid || (customer.totalRevenue * 0.6);
    const outstanding = customer.outstanding || (customer.totalRevenue - totalPaid);
    const paymentPercentage = customer.totalRevenue > 0 ? (totalPaid / customer.totalRevenue) * 100 : 0;

    return {
      orderCount: customerOrders.length,
      totalRevenue: customer.totalRevenue || 0,
      totalPaid,
      outstanding,
      paymentPercentage: Math.round(paymentPercentage),
      orders: customerOrders
    };
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
                {customer.customerType === 'premium' ? 'مميز' : 'عادي'}
              </span>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Eye className="w-4 h-4 text-gray-500" />
          </button>
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
              <span className="text-gray-500">المتبقي: </span>
              <span className="font-semibold text-red-600">
                ${stats.outstanding.toLocaleString()}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">الطلبات: </span>
              <span className="font-semibold text-green-600">{stats.orderCount}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const CustomerModal = ({ customer, onClose }: { customer: Customer; onClose: () => void }) => {
    const stats = getCustomerStats(customer);
    
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
                <p className="text-gray-600">تفاصيل العميل</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* القسم الأول: معلومات العميل */}
              <div className="lg:col-span-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  معلومات العميل
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">الاسم الكامل</p>
                      <p className="font-medium">{customer.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      customer.customerType === 'premium' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      ★
                    </span>
                    <div>
                      <p className="text-sm text-gray-600">نوع العميل</p>
                      <p className="font-medium">
                        {customer.customerType === 'premium' ? 'عميل مميز' : 'عميل عادي'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">رقم الهاتف</p>
                      <p className="font-medium">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">الدولة</p>
                      <p className="font-medium">{customer.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">الإيميل</p>
                      <p className="font-medium">{customer.email}</p>
                    </div>
                  </div>
                  {customer.company && (
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">اسم الشركة</p>
                        <p className="font-medium">{customer.company}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* القسم الثاني: المعلومات المالية */}
              <div className="lg:col-span-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  المعلومات المالية
                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600">عدد الطلبات</span>
                      <span className="text-2xl font-bold text-blue-700">{stats.orderCount}</span>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-600">إجمالي الطلبات</span>
                      <span className="text-2xl font-bold text-green-700">
                        ${stats.totalRevenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-emerald-600">المدفوع</span>
                      <span className="text-2xl font-bold text-emerald-700">
                        ${stats.totalPaid.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-600">المتبقي</span>
                      <span className="text-2xl font-bold text-red-700">
                        ${stats.outstanding.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">نسبة الدفع</span>
                      <span className="text-lg font-bold text-gray-700">{stats.paymentPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats.paymentPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* القسم الثالث: سجل الطلبات */}
              <div className="lg:col-span-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  سجل الطلبات
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {stats.orders.length > 0 ? (
                    stats.orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{order.id}</p>
                            <p className="text-sm text-gray-500">{order.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">${order.total.toLocaleString()}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'processing'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status === 'completed' ? 'مكتمل' :
                               order.status === 'processing' ? 'قيد التنفيذ' :
                               order.status === 'cancelled' ? 'ملغي' : 'معلق'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>لا توجد طلبات لهذا العميل</p>
                    </div>
                  )}
                </div>
              </div>
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
          <p className="text-gray-600 mt-1">إدارة وعرض معلومات العملاء</p>
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
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              <p className="text-gray-600">إجمالي العملاء</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div className="mr-4">
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter(c => c.customerType === 'premium').length}
              </p>
              <p className="text-gray-600">عملاء مميزون</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-yellow-500" />
            <div className="mr-4">
              <p className="text-2xl font-bold text-gray-900">
                ${customers.reduce((sum, c) => sum + (c.totalRevenue || 0), 0).toLocaleString()}
              </p>
              <p className="text-gray-600">إجمالي الإيرادات</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <ShoppingBag className="w-8 h-8 text-purple-500" />
            <div className="mr-4">
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              <p className="text-gray-600">إجمالي الطلبات</p>
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
              placeholder="البحث عن العملاء..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>تصفية</span>
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
            <span>تصدير</span>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عملاء</h3>
          <p className="text-gray-600">
            {searchTerm ? "لم يتم العثور على عملاء مطابقين للبحث" : "ابدأ بإضافة عملاء جدد"}
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
          fetchData(); // Refresh data after adding customer
        }}
      />
    </div>
  );
}
