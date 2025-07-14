import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { showSuccessToast, showErrorToast } from "../utils/toast";
import ConfirmationModal from "../components/ConfirmationModal";
import apiService from "../services/api";
import {
  CreateInvoiceModal,
  UploadInvoiceModal,
} from "../components/InvoiceModals";
import EditInvoiceModal from "../components/EditInvoiceModal";
import {
  FileText,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
} from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber?: string;
  customer: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  date: string;
  dueDate?: string;
  type?: "sales" | "purchase";
  typeLabel?: string;
  items?: Array<{
    id: number;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  subtotal?: number;
  tax?: number;
  total?: number;
  amount?: number;
  amountReceived?: number;
  amountRemaining?: number;
  paymentStatus: "paid" | "unpaid" | "partial";
  paymentMethod?: "cash" | "bank_transfer" | "wire_transfer";
  notes?: string;
  createdDate?: string;
  lastPaymentDate?: string | null;
  isOverdue?: boolean;
  attachedFile?: {
    id: string;
    originalName: string;
    filename: string;
    path: string;
    size: number;
    mimetype: string;
    uploadDate: string;
  };
}

const paymentStatusConfig = {
  paid: {
    label: { en: "Paid", ar: "مدفوع" },
    color: "bg-green-100 text-green-800",
  },
  unpaid: {
    label: { en: "Unpaid", ar: "غير مدفوع" },
    color: "bg-red-100 text-red-800",
  },
  partial: {
    label: { en: "Partially Paid", ar: "مدفوع جزئياً" },
    color: "bg-yellow-100 text-yellow-800",
  },
};

function StatusBadge({
  status,
  language,
}: {
  status: keyof typeof paymentStatusConfig;
  language: "en" | "ar";
}) {
  const statusConfig = paymentStatusConfig[status];
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
    >
      {statusConfig.label[language]}
    </span>
  );
}

export default function Invoices() {
  const { language, t } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    invoiceId: string | null;
  }>({ isOpen: false, invoiceId: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const invoicesData = await apiService.getInvoices();
      setInvoices(invoicesData);
    } catch (error) {
      console.error("خطأ في جلب الفواتير:", error);
      showErrorToast(language === "ar" ? "خطأ في جلب بيانات الفواتير" : "Error fetching invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceCreated = () => {
    fetchInvoices();
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await apiService.deleteInvoice(invoiceId);
      setInvoices(prevInvoices => prevInvoices.filter(inv => inv.id !== invoiceId));
      showSuccessToast(language === "ar" ? "تم حذف الفاتورة بنجاح" : "Invoice deleted successfully");
      setDeleteConfirmation({ isOpen: false, invoiceId: null });
    } catch (error) {
      console.error("خطأ في حذف الفاتورة:", error);
      showErrorToast(language === "ar" ? "فشل في حذف الفاتورة" : "Failed to delete invoice");
    }
  };

  const handleSaveInvoice = async (updatedInvoice: Invoice) => {
    try {
      await apiService.updateInvoice(updatedInvoice.id, updatedInvoice);
      setInvoices(prevInvoices => 
        prevInvoices.map(inv => 
          inv.id === updatedInvoice.id ? updatedInvoice : inv
        )
      );
      showSuccessToast(language === "ar" ? "تم حفظ الفاتورة بنجاح" : "Invoice saved successfully");
      setShowEditModal(false);
      setSelectedInvoice(null);
    } catch (error) {
      console.error("خطأ في حفظ الفاتورة:", error);
      showErrorToast(language === "ar" ? "فشل في حفظ الفاتورة" : "Failed to save invoice");
    }
  };

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  // حساب الإحصائيات
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(inv => inv.paymentStatus === "paid").length;
  const partialInvoices = invoices.filter(inv => inv.paymentStatus === "partial").length;
  const unpaidInvoices = invoices.filter(inv => inv.paymentStatus === "unpaid").length;
  const overdueInvoices = invoices.filter(inv => inv.isOverdue).length;

  // فلترة الفواتير
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus =
      selectedStatus === "all" || invoice.paymentStatus === selectedStatus;
    
    const matchesType =
      selectedType === "all" || invoice.type === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-primary"></div>
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
              ? "رفع وأرشفة الفواتير وتتبع حالة الدفع"
              : "Upload, archive invoices and track payment status"}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3 rtl:space-x-reverse">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Upload className="w-4 h-4" />
            <span>{language === "ar" ? "رفع فاتورة" : "Upload Invoice"}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-primary text-white rounded-lg hover:bg-green-secondary transition-colors flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Plus className="w-4 h-4" />
            <span>{language === "ar" ? "إنشاء فاتورة" : "Create Invoice"}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
            title: language === "ar" ? "مدفوع جزئياً" : "Partially Paid",
            value: partialInvoices,
            icon: Clock,
            color: "yellow",
          },
          {
            title: language === "ar" ? "غير مدفوع" : "Unpaid",
            value: unpaidInvoices,
            icon: AlertTriangle,
            color: "red",
          },
          {
            title: language === "ar" ? "متأخر" : "Overdue",
            value: overdueInvoices,
            icon: Calendar,
            color: "purple",
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
              <div
                className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}
              >
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
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="relative">
              <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={
                  language === "ar"
                    ? "بحث في الفواتير..."
                    : "Search invoices..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent w-64"
              />
            </div>
            
            {/* فلتر حالة الدفع */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
            >
              <option value="all">
                {language === "ar" ? "جميع الحالات" : "All Status"}
              </option>
              <option value="paid">
                {language === "ar" ? "مدفوع" : "Paid"}
              </option>
              <option value="partial">
                {language === "ar" ? "مدفوع جزئياً" : "Partially Paid"}
              </option>
              <option value="unpaid">
                {language === "ar" ? "غير مدفوع" : "Unpaid"}
              </option>
            </select>

            {/* فلتر نوع الفاتورة */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
            >
              <option value="all">
                {language === "ar" ? "جميع الأنواع" : "All Types"}
              </option>
              <option value="sales">
                {language === "ar" ? "فاتورة مبيعات" : "Sales Invoice"}
              </option>
              <option value="purchase">
                {language === "ar" ? "فاتورة شراء" : "Purchase Invoice"}
              </option>
            </select>
          </div>
          
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="text-sm text-gray-600">
              {language === "ar"
                ? `عرض ${filteredInvoices.length} من ${totalInvoices} فاتورة`
                : `Showing ${filteredInvoices.length} of ${totalInvoices} invoices`}
            </span>
            <button
              onClick={() => {
                // تصدير CSV
                const csvContent = [
                  "Invoice Number,Customer,Date,Due Date,Total,Status,Type",
                  ...filteredInvoices.map(
                    (invoice) =>
                      `${invoice.invoiceNumber || invoice.id},${invoice.customer},${invoice.date},${invoice.dueDate || ''},${invoice.total || invoice.amount || 0},${invoice.paymentStatus},${invoice.type || 'sales'}`,
                  ),
                ].join("\n");

                const blob = new Blob([csvContent], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `invoices_export_${new Date().toISOString().split("T")[0]}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                showSuccessToast(language === "ar" ? "تم تصدير الفواتير بنجاح" : "Invoices exported successfully");
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
            >
              <Download className="w-4 h-4" />
              <span>{language === "ar" ? "تصدير" : "Export"}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* جدول الفواتير */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div className="table-responsive">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "رقم الفاتورة" : "Invoice Number"}
                </th>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "العميل" : "Customer"}
                </th>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "النوع" : "Type"}
                </th>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "التاريخ" : "Date"}
                </th>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "المبلغ" : "Amount"}
                </th>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "الحالة" : "Status"}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "الإجراءات" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleInvoiceClick(invoice)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.invoiceNumber || invoice.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4 rtl:mr-4 rtl:ml-0">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.customer}
                        </div>
                        {invoice.customerEmail && (
                          <div className="text-sm text-gray-500">
                            {invoice.customerEmail}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.type === 'sales' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {invoice.type === 'sales' 
                        ? (language === "ar" ? "مبيعات" : "Sales")
                        : (language === "ar" ? "شراء" : "Purchase")
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${(invoice.total || invoice.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge 
                      status={invoice.paymentStatus} 
                      language={language} 
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInvoice(invoice);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title={language === "ar" ? "عرض التفاصيل" : "View Details"}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInvoice(invoice);
                          setShowEditModal(true);
                        }}
                        className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                        title={language === "ar" ? "تعديل" : "Edit"}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmation({ isOpen: true, invoiceId: invoice.id });
                        }}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        title={language === "ar" ? "حذف" : "Delete"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {invoice.attachedFile && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`http://localhost:3001/api/invoices/download/${invoice.attachedFile!.filename}`, '_blank');
                          }}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded transition-colors"
                          title={language === "ar" ? "تحميل الملف" : "Download File"}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {language === "ar" ? "لا توجد فواتير" : "No invoices found"}
            </h3>
            <p className="text-gray-600">
              {language === "ar"
                ? "لم يتم العثور على فواتير مطابقة لمعايير البحث."
                : "No invoices match your search criteria."}
            </p>
          </div>
        )}
      </motion.div>

      {/* المودالات */}
      <CreateInvoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onInvoiceCreated={handleInvoiceCreated}
      />
      
      <UploadInvoiceModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />

      {selectedInvoice && (
        <EditInvoiceModal
          invoice={selectedInvoice}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedInvoice(null);
          }}
          onSave={handleSaveInvoice}
        />
      )}

      {/* مودال تأكيد الحذف */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, invoiceId: null })}
        onConfirm={() => {
          if (deleteConfirmation.invoiceId) {
            handleDeleteInvoice(deleteConfirmation.invoiceId);
          }
        }}
        title={language === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
        message={language === "ar" 
          ? "هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء."
          : "Are you sure you want to delete this invoice? This action cannot be undone."
        }
        confirmText={language === "ar" ? "حذف" : "Delete"}
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
        type="danger"
      />
    </div>
  );
}
