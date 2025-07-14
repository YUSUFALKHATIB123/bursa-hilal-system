import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import apiService from "../services/api";
import {
  FileText,
  Plus,
  Upload,
  Download,
  Search,
  Eye,
  Edit,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
} from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber?: string;
  customer: string;
  date: string;
  dueDate?: string;
  total?: number;
  paymentStatus?: "paid" | "partial" | "unpaid";
  type?: "sales" | "purchase";
}

// مكون بسيط لعرض حالة الدفع
function StatusBadge({ status, language }: { status?: string; language: string }) {
  const getStatusInfo = (status?: string) => {
    switch (status) {
      case "paid":
        return {
          text: language === "ar" ? "مدفوع" : "Paid",
          className: "bg-green-100 text-green-800",
        };
      case "partial":
        return {
          text: language === "ar" ? "مدفوع جزئياً" : "Partially Paid",
          className: "bg-yellow-100 text-yellow-800",
        };
      case "unpaid":
        return {
          text: language === "ar" ? "غير مدفوع" : "Unpaid",
          className: "bg-red-100 text-red-800",
        };
      default:
        return {
          text: language === "ar" ? "غير محدد" : "Unknown",
          className: "bg-gray-100 text-gray-800",
        };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
      {statusInfo.text}
    </span>
  );
}

export default function Invoices() {
  const { language, t } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      // محاولة جلب الفواتير من API
      const invoicesData = await apiService.getInvoices();
      setInvoices(invoicesData || []);
    } catch (error) {
      console.error("خطأ في جلب الفواتير:", error);
      // إنشاء بيانات تجريبية في حالة فشل API
      setInvoices([
        {
          id: "INV-001",
          invoiceNumber: "INV-001",
          customer: "شركة النسيج الليبية",
          date: "2025-01-15",
          dueDate: "2025-02-15",
          total: 1500,
          paymentStatus: "paid",
          type: "sales"
        },
        {
          id: "INV-002", 
          invoiceNumber: "INV-002",
          customer: "شركة القاهرة للأزياء",
          date: "2025-01-10",
          dueDate: "2025-02-10",
          total: 2300,
          paymentStatus: "unpaid",
          type: "sales"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // تصفية الفواتير
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = searchTerm === "" || 
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || invoice.paymentStatus === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // إحصائيات
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(inv => inv.paymentStatus === "paid").length;
  const unpaidInvoices = invoices.filter(inv => inv.paymentStatus === "unpaid").length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex text-sm text-gray-500">
        <span>{language === "ar" ? "لوحة التحكم" : "Dashboard"}</span>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{language === "ar" ? "الفواتير" : "Invoices"}</span>
      </nav>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === "ar" ? "الفواتير" : "Invoices"}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === "ar"
              ? "إدارة الفواتير وتتبع حالة الدفع"
              : "Manage invoices and track payment status"}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>{language === "ar" ? "رفع فاتورة" : "Upload Invoice"}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{language === "ar" ? "إنشاء فاتورة" : "Create Invoice"}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: language === "ar" ? "إجمالي الفواتير" : "Total Invoices",
            value: totalInvoices,
            icon: FileText,
            color: "blue",
          },
          {
            title: language === "ar" ? "مدفوع" : "Paid",
            value: paidInvoices,
            icon: CheckCircle,
            color: "green",
          },
          {
            title: language === "ar" ? "غير مدفوع" : "Unpaid",
            value: unpaidInvoices,
            icon: AlertTriangle,
            color: "red",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
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

      {/* Search and Filter */}
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
                  language === "ar"
                    ? "بحث في الفواتير..."
                    : "Search invoices..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">
                {language === "ar" ? "جميع الحالات" : "All Status"}
              </option>
              <option value="paid">{language === "ar" ? "مدفوع" : "Paid"}</option>
              <option value="partial">{language === "ar" ? "مدفوع جزئياً" : "Partial"}</option>
              <option value="unpaid">{language === "ar" ? "غير مدفوع" : "Unpaid"}</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            {language === "ar"
              ? `عرض ${filteredInvoices.length} من ${totalInvoices} فاتورة`
              : `Showing ${filteredInvoices.length} of ${totalInvoices} invoices`}
          </div>
        </div>
      </motion.div>

      {/* Invoices Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "رقم الفاتورة" : "Invoice Number"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "العميل" : "Customer"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "التاريخ" : "Date"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "المبلغ" : "Total"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "الحالة" : "Status"}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "الإجراءات" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice, index) => (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.customer}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {invoice.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${invoice.total?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={invoice.paymentStatus} language={language} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
                        title={language === "ar" ? "عرض" : "View"}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                        title={language === "ar" ? "تعديل" : "Edit"}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                        title={language === "ar" ? "حذف" : "Delete"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
