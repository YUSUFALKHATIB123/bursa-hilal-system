import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import AnimatedCounter from "../components/AnimatedCounter";
import { CurrencyConverter, CURRENCY_CONFIG } from "../utils/currency";
import { showSuccessToast, showErrorToast } from "../utils/toast";
import apiService from "../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
  X,
  DollarSign,
} from "lucide-react";



interface Invoice {
  id: string;
  invoiceNumber?: string;
  customer: string;
  customerEmail?: string;
  customerPhone?: string;
  date: string;
  dueDate?: string;
  total?: number;
  amount?: number;
  paymentStatus?: "paid" | "partial" | "unpaid";
  status?: string;
  type?: "sales" | "purchase";
  description?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
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

// مكون عرض حالة الدفع
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

// مكون إنشاء فاتورة جديدة
function CreateInvoiceModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void; 
}) {
  const { language } = useLanguage();
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer: "",
    customerId: "",
    orderId: "",
    amount: "",
    dueDate: "",
    description: "",
    type: "sales",
    paymentStatus: "unpaid",
  });

  // جلب العملاء والطلبات
  useEffect(() => {
    if (isOpen) {
      fetchCustomersAndOrders();
    }
  }, [isOpen]);

  const fetchCustomersAndOrders = async () => {
    try {
      const [customersData, ordersData] = await Promise.all([
        apiService.getCustomers(),
        apiService.getOrders()
      ]);
      setCustomers(customersData || []);
      setOrders(ordersData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      // بيانات تجريبية
      setCustomers([
        { id: "1", name: "شركة النسيج الليبية", email: "libya@textile.com" },
        { id: "2", name: "شركة القاهرة للأزياء", email: "cairo@fashion.com" }
      ]);
      setOrders([
        { id: "ORD-001", customerId: "1", customerName: "شركة النسيج الليبية", totalAmount: 1500 },
        { id: "ORD-002", customerId: "2", customerName: "شركة القاهرة للأزياء", totalAmount: 2300 }
      ]);
    }
  };

  // فلترة الطلبات حسب العميل
  useEffect(() => {
    if (formData.customerId) {
      const customerOrders = orders.filter(order => order.customerId === formData.customerId);
      setFilteredOrders(customerOrders);
    } else {
      setFilteredOrders([]);
    }
  }, [formData.customerId, orders]);

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    setFormData(prev => ({
      ...prev,
      customerId,
      customer: customer ? customer.name : "",
      orderId: "", // إعادة تعيين الطلب المحدد
    }));
  };

  const handleOrderChange = (orderId: string) => {
    const order = filteredOrders.find(o => o.id === orderId);
    setFormData(prev => ({
      ...prev,
      orderId,
      amount: order ? order.totalAmount.toString() : "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer || !formData.amount) {
      showErrorToast(language === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const allInvoices = await apiService.getInvoices();
      const nextInvoiceNumber = getNextInvoiceNumber(allInvoices || []);
      const invoiceData = {
        invoiceNumber: nextInvoiceNumber,
        customer: formData.customer,
        customerId: formData.customerId,
        orderId: formData.orderId,
        amount: parseFloat(formData.amount),
        total: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        description: formData.description,
        type: formData.type,
        paymentStatus: formData.paymentStatus,
        date: new Date().toISOString().split('T')[0],
      };

      await apiService.createInvoice(invoiceData);
      showSuccessToast(language === "ar" ? "تم إنشاء الفاتورة بنجاح" : "Invoice created successfully");
      onSuccess();
      onClose();
      setFormData({
        customer: "",
        customerId: "",
        orderId: "",
        amount: "",
        dueDate: "",
        description: "",
        type: "sales",
        paymentStatus: "unpaid",
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
      showErrorToast(language === "ar" ? "فشل في إنشاء الفاتورة" : "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {language === "ar" ? "إنشاء فاتورة جديدة" : "Create New Invoice"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* نوع الفاتورة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "ar" ? "نوع الفاتورة" : "Invoice Type"}
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="sales">{language === "ar" ? "فاتورة مبيعات" : "Sales Invoice"}</option>
              <option value="purchase">{language === "ar" ? "فاتورة شراء" : "Purchase Invoice"}</option>
            </select>
          </div>

          {/* العميل */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "ar" ? "العميل *" : "Customer *"}
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">{language === "ar" ? "اختر العميل" : "Select Customer"}</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          {/* حالة الدفع */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "ar" ? "حالة الدفع" : "Payment Status"}
            </label>
            <select
              value={formData.paymentStatus}
              onChange={e => setFormData(prev => ({ ...prev, paymentStatus: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="paid">{language === "ar" ? "مدفوع" : "Paid"}</option>
              <option value="partial">{language === "ar" ? "مدفوع جزئياً" : "Partially Paid"}</option>
              <option value="unpaid">{language === "ar" ? "غير مدفوع" : "Unpaid"}</option>
            </select>
          </div>

          {/* المبلغ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "ar" ? "المبلغ *" : "Amount *"}
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={language === "ar" ? "أدخل المبلغ" : "Enter amount"}
              required
            />
          </div>

          {/* تاريخ الاستحقاق */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "ar" ? "تاريخ الاستحقاق" : "Due Date"}
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* الوصف */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "ar" ? "الوصف" : "Description"}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={language === "ar" ? "أدخل وصف الفاتورة" : "Enter invoice description"}
            />
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {language === "ar" ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {language === "ar" ? "جاري الإنشاء..." : "Creating..."}
                </div>
              ) : (
                language === "ar" ? "إنشاء الفاتورة" : "Create Invoice"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// مكون رفع فاتورة
function UploadInvoiceModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void; 
}) {
  const { language } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    customer: "",
    amount: "",
    description: "",
  });
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setParseError(null);
        setParsing(true);
        // محاولة قراءة البيانات تلقائياً من الملف
        try {
          // مثال: استدعاء apiService.parseInvoiceFile (يجب أن تكون موجودة في backend)
          const parsed = await apiService.parseInvoiceFile(selectedFile);
          setFormData({
            customer: parsed.customer || "",
            amount: parsed.amount || "",
            description: parsed.description || "",
          });
        } catch (err) {
          setParseError(language === "ar" ? "فشل في قراءة بيانات الفاتورة تلقائياً. يمكنك تعبئة الحقول يدوياً." : "Failed to auto-parse invoice data. You can fill the fields manually.");
        } finally {
          setParsing(false);
        }
      } else {
        showErrorToast(language === "ar" ? "نوع الملف غير مدعوم. يرجى اختيار PDF أو صورة" : "Unsupported file type. Please select PDF or image");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !formData.customer || !formData.amount) {
      showErrorToast(language === "ar" ? "يرجى ملء جميع الحقول واختيار ملف" : "Please fill all fields and select a file");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('customer', formData.customer);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('description', formData.description);

      // محاكاة تقدم الرفع
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await apiService.uploadInvoiceFile(formDataToSend);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        showSuccessToast(language === "ar" ? "تم رفع الفاتورة بنجاح" : "Invoice uploaded successfully");
        onSuccess();
        onClose();
        setFile(null);
        setFormData({ customer: "", amount: "", description: "" });
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      console.error("Error uploading file:", error);
      showErrorToast(language === "ar" ? "فشل في رفع الفاتورة" : "Failed to upload invoice");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {language === "ar" ? "رفع فاتورة" : "Upload Invoice"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* اختيار الملف */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "ar" ? "اختر الملف *" : "Select File *"}
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            {file && (
              <p className="text-sm text-green-600 mt-1">
                {language === "ar" ? "تم اختيار:" : "Selected:"} {file.name}
              </p>
            )}
          </div>

          {/* اسم العميل */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "ar" ? "اسم العميل *" : "Customer Name *"}
            </label>
            <input
              type="text"
              value={formData.customer}
              onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={language === "ar" ? "أدخل اسم العميل" : "Enter customer name"}
              required
            />
          </div>

          {/* المبلغ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "ar" ? "المبلغ *" : "Amount *"}
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={language === "ar" ? "أدخل المبلغ" : "Enter amount"}
              required
            />
          </div>

          {/* الوصف */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "ar" ? "الوصف" : "Description"}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={language === "ar" ? "أدخل وصف الفاتورة" : "Enter invoice description"}
            />
          </div>

          {parsing && (
            <div className="text-blue-600 text-sm mb-2">{language === "ar" ? "جاري قراءة بيانات الفاتورة..." : "Parsing invoice data..."}</div>
          )}
          {parseError && (
            <div className="text-red-600 text-sm mb-2">{parseError}</div>
          )}

          {/* شريط التقدم */}
          {uploading && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{language === "ar" ? "جاري الرفع..." : "Uploading..."}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* أزرار الإجراءات */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {language === "ar" ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {language === "ar" ? "جاري الرفع..." : "Uploading..."}
                </div>
              ) : (
                language === "ar" ? "رفع الفاتورة" : "Upload Invoice"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// مكون عرض تفاصيل الفاتورة
function InvoiceDetailModal({ 
  invoice, 
  isOpen, 
  onClose 
}: { 
  invoice: Invoice | null; 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const { language } = useLanguage();

  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {language === "ar" ? "تفاصيل الفاتورة" : "Invoice Details"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                {language === "ar" ? "رقم الفاتورة" : "Invoice Number"}
              </label>
              <p className="text-lg font-semibold text-gray-900">{invoice.invoiceNumber || invoice.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                {language === "ar" ? "العميل" : "Customer"}
              </label>
              <p className="text-lg font-semibold text-gray-900">{invoice.customer}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                {language === "ar" ? "التاريخ" : "Date"}
              </label>
              <p className="text-lg font-semibold text-gray-900">{invoice.date}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                {language === "ar" ? "تاريخ الاستحقاق" : "Due Date"}
              </label>
              <p className="text-lg font-semibold text-gray-900">{invoice.dueDate || "—"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                {language === "ar" ? "المبلغ الإجمالي" : "Total Amount"}
              </label>
              <p className="text-lg font-semibold text-green-600">
                ${(invoice.total || invoice.amount || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                {language === "ar" ? "حالة الدفع" : "Payment Status"}
              </label>
              <StatusBadge status={invoice.paymentStatus || invoice.status} language={language} />
            </div>
          </div>

          {invoice.description && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                {language === "ar" ? "الوصف" : "Description"}
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{invoice.description}</p>
            </div>
          )}

          {invoice.items && invoice.items.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                {language === "ar" ? "العناصر" : "Items"}
              </label>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {language === "ar" ? "الوصف" : "Description"}
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {language === "ar" ? "الكمية" : "Quantity"}
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {language === "ar" ? "السعر" : "Unit Price"}
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {language === "ar" ? "الإجمالي" : "Total"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">${item.unitPrice}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">${item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {invoice.attachedFile && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                {language === "ar" ? "الملف المرفق" : "Attached File"}
              </label>
              <a
                href={`/server/uploads/invoices/${invoice.attachedFile.filename}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline flex items-center space-x-2 rtl:space-x-reverse"
              >
                <FileText className="w-5 h-5 mr-1 inline" />
                {invoice.attachedFile.originalName}
              </a>
              {/* إذا كان الملف صورة، اعرضها */}
              {(invoice.attachedFile.mimetype.startsWith('image/')) && (
                <img
                  src={`/server/uploads/invoices/${invoice.attachedFile.filename}`}
                  alt="فاتورة مرفقة"
                  className="mt-2 max-w-xs border rounded shadow"
                />
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {language === "ar" ? "إغلاق" : "Close"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// مكون تأكيد الحذف
function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  invoiceNumber 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  invoiceNumber: string; 
}) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg p-6 w-full max-w-md"
      >
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            {language === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
          </h3>
        </div>

        <p className="text-gray-600 mb-6">
          {language === "ar" 
            ? `هل أنت متأكد من حذف الفاتورة ${invoiceNumber}؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete invoice ${invoiceNumber}? This action cannot be undone.`
          }
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {language === "ar" ? "إلغاء" : "Cancel"}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {language === "ar" ? "حذف" : "Delete"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Invoices() {
  const { language } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  
  // حالات المودالات
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  // 1. أضف حالة مودال التعديل وحالة الفاتورة المحددة للتعديل
  const [showEditModal, setShowEditModal] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const invoicesData = await apiService.getInvoices();
      setInvoices((invoicesData || []).filter((inv: any) => !inv.isDeleted)); // تجاهل المحذوفة
    } catch (error) {
      console.error("خطأ في جلب الفواتير:", error);
      showErrorToast(language === "ar" ? "خطأ في جلب بيانات الفواتير" : "Error fetching invoices");
      // بيانات تجريبية
      setInvoices([
        {
          id: "INV-001",
          invoiceNumber: "INV-001",
          customer: "شركة النسيج الليبية",
          customerEmail: "libya@textile.com",
          date: "2025-01-15",
          dueDate: "2025-02-15",
          total: 1500,
          paymentStatus: "paid",
          type: "sales",
          description: "فاتورة مبيعات أقمشة قطنية"
        },
        {
          id: "INV-002", 
          invoiceNumber: "INV-002",
          customer: "شركة القاهرة للأزياء",
          customerEmail: "cairo@fashion.com",
          date: "2025-01-10",
          dueDate: "2025-02-10",
          total: 2300,
          paymentStatus: "unpaid",
          type: "sales",
          description: "فاتورة مبيعات أقمشة حريرية"
        },
        {
          id: "INV-003",
          invoiceNumber: "INV-003",
          customer: "مصنع الخيوط المتحدة",
          customerEmail: "united@threads.com",
          date: "2025-01-05",
          dueDate: "2025-02-05",
          total: 800,
          paymentStatus: "partial",
          type: "purchase",
          description: "فاتورة شراء خيوط"
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
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || invoice.paymentStatus === selectedStatus;
    const matchesType = selectedType === "all" || invoice.type === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // إحصائيات
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(inv => inv.paymentStatus === "paid").length;
  const unpaidInvoices = invoices.filter(inv => inv.paymentStatus === "unpaid").length;
  const partialInvoices = invoices.filter(inv => inv.paymentStatus === "partial").length;

  // معالجات الأحداث
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  // 2. فعّل زر التعديل في جدول الفواتير
  const handleEditInvoice = (invoice: Invoice) => {
    setInvoiceToEdit(invoice);
    setShowEditModal(true);
  };



  const handleExportPDF = async (invoice: Invoice) => {
    try {
      // إنشاء عنصر HTML مؤقت للفاتورة
      const invoiceElement = document.createElement('div');
      invoiceElement.style.position = 'absolute';
      invoiceElement.style.left = '-9999px';
      invoiceElement.style.top = '0';
      invoiceElement.style.width = '800px';
      invoiceElement.style.padding = '40px';
      invoiceElement.style.backgroundColor = 'white';
      invoiceElement.style.fontFamily = 'Arial, sans-serif';
      invoiceElement.style.direction = language === 'ar' ? 'rtl' : 'ltr';
      invoiceElement.style.textAlign = language === 'ar' ? 'right' : 'left';
      
      // إضافة شعار الشركة كخلفية شفافة
      invoiceElement.innerHTML = `
        <div style="position: relative; min-height: 100vh;">
          <!-- شعار الشركة كخلفية شفافة -->
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            height: 400px;
            background-image: url('/logo.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            opacity: 0.1;
            z-index: 1;
          "></div>
          
          <!-- محتوى الفاتورة -->
          <div style="position: relative; z-index: 2;">
            <!-- رأس الفاتورة -->
            <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px;">
              <h1 style="color: #2563eb; font-size: 32px; margin: 0;">${language === 'ar' ? 'شركة برصة هلال' : 'Bursa Hilal Company'}</h1>
              <h2 style="color: #333; font-size: 24px; margin: 10px 0;">${language === 'ar' ? 'فاتورة' : 'INVOICE'}</h2>
            </div>
            
            <!-- معلومات الفاتورة -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
              <div>
                <h3 style="color: #333; margin-bottom: 15px;">${language === 'ar' ? 'معلومات الفاتورة:' : 'Invoice Information:'}</h3>
                <p><strong>${language === 'ar' ? 'رقم الفاتورة:' : 'Invoice Number:'}</strong> ${invoice.invoiceNumber || invoice.id}</p>
                <p><strong>${language === 'ar' ? 'التاريخ:' : 'Date:'}</strong> ${invoice.date}</p>
                <p><strong>${language === 'ar' ? 'تاريخ الاستحقاق:' : 'Due Date:'}</strong> ${invoice.dueDate || (language === 'ar' ? 'غير محدد' : 'Not specified')}</p>
                <p><strong>${language === 'ar' ? 'النوع:' : 'Type:'}</strong> ${invoice.type === 'sales' ? (language === 'ar' ? 'فاتورة مبيعات' : 'Sales Invoice') : invoice.type === 'purchase' ? (language === 'ar' ? 'فاتورة شراء' : 'Purchase Invoice') : (language === 'ar' ? 'غير محدد' : 'Not specified')}</p>
              </div>
              <div>
                <h3 style="color: #333; margin-bottom: 15px;">${language === 'ar' ? 'معلومات العميل:' : 'Customer Information:'}</h3>
                <p><strong>${language === 'ar' ? 'اسم العميل:' : 'Customer Name:'}</strong> ${invoice.customer}</p>
                <p><strong>${language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</strong> ${invoice.customerEmail || (language === 'ar' ? 'غير محدد' : 'Not specified')}</p>
                <p><strong>${language === 'ar' ? 'رقم الهاتف:' : 'Phone:'}</strong> ${invoice.customerPhone || (language === 'ar' ? 'غير محدد' : 'Not specified')}</p>
              </div>
            </div>
            
            <!-- تفاصيل المنتجات -->
            ${invoice.items && invoice.items.length > 0 ? `
            <div style="margin-bottom: 30px;">
              <h3 style="color: #333; margin-bottom: 15px;">${language === 'ar' ? 'المنتجات/الخدمات:' : 'Products/Services:'}</h3>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">${language === 'ar' ? 'الوصف' : 'Description'}</th>
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">${language === 'ar' ? 'الكمية' : 'Quantity'}</th>
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">${language === 'ar' ? 'السعر الوحدة' : 'Unit Price'}</th>
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">${language === 'ar' ? 'الإجمالي' : 'Total'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.items.map(item => `
                    <tr>
                      <td style="border: 1px solid #ddd; padding: 12px;">${item.description}</td>
                      <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.quantity}</td>
                      <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.unitPrice} ${language === 'ar' ? 'ريال' : 'SAR'}</td>
                      <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.total} ${language === 'ar' ? 'ريال' : 'SAR'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}
            
            <!-- ملخص مالي -->
            <div style="margin-bottom: 30px;">
              <h3 style="color: #333; margin-bottom: 15px;">${language === 'ar' ? 'الملخص المالي:' : 'Financial Summary:'}</h3>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
                <div>
                  <p><strong>${language === 'ar' ? 'المبلغ الإجمالي:' : 'Total Amount:'}</strong></p>
                  <p><strong>${language === 'ar' ? 'حالة الدفع:' : 'Payment Status:'}</strong></p>
                </div>
                <div style="text-align: right;">
                  <p style="font-size: 24px; color: #2563eb; font-weight: bold;">${(invoice.total || invoice.amount || 0).toLocaleString()} ${language === 'ar' ? 'ريال' : 'SAR'}</p>
                  <p style="font-size: 18px; color: ${invoice.paymentStatus === 'paid' ? '#10b981' : invoice.paymentStatus === 'partial' ? '#f59e0b' : '#ef4444'};">
                    ${invoice.paymentStatus === 'paid' ? (language === 'ar' ? 'مدفوع' : 'Paid') : 
                      invoice.paymentStatus === 'partial' ? (language === 'ar' ? 'مدفوع جزئياً' : 'Partially Paid') : 
                      invoice.paymentStatus === 'unpaid' ? (language === 'ar' ? 'غير مدفوع' : 'Unpaid') : 
                      invoice.status || (language === 'ar' ? 'غير محدد' : 'Not specified')}
                  </p>
                </div>
              </div>
            </div>
            
            ${invoice.description ? `
            <div style="margin-bottom: 30px;">
              <h3 style="color: #333; margin-bottom: 15px;">${language === 'ar' ? 'الوصف:' : 'Description:'}</h3>
              <p style="padding: 15px; background-color: #f8f9fa; border-radius: 8px; border-right: 4px solid #2563eb;">${invoice.description}</p>
            </div>
            ` : ''}
            
            <!-- تذييل الفاتورة -->
            <div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #333; text-align: center;">
              <p style="color: #666; font-size: 14px;">${language === 'ar' ? 'تم إنشاء هذا التقرير في:' : 'Generated on:'} ${new Date().toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}</p>
              <p style="color: #666; font-size: 12px;">${language === 'ar' ? 'شركة برصة هلال - جميع الحقوق محفوظة' : 'Bursa Hilal Company - All rights reserved'}</p>
            </div>
          </div>
        </div>
      `;
      
      // إضافة العنصر إلى الصفحة
      document.body.appendChild(invoiceElement);
      
      // تحويل العنصر إلى صورة
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // إنشاء PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // إضافة الصورة الأولى
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // إضافة صفحات إضافية إذا لزم الأمر
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // إضافة صورة الملف المرفق إذا كان صورة
      if (invoice.attachedFile && invoice.attachedFile.mimetype.startsWith('image/')) {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = `/server/uploads/invoices/${invoice.attachedFile.filename}`;
        await new Promise((resolve) => { img.onload = resolve; });
        const imgCanvas = document.createElement('canvas');
        imgCanvas.width = img.width;
        imgCanvas.height = img.height;
        imgCanvas.getContext('2d')?.drawImage(img, 0, 0);
        const imgData2 = imgCanvas.toDataURL('image/png');
        pdf.addPage();
        pdf.setFontSize(18);
        pdf.text(language === 'ar' ? 'صورة الفاتورة المرفوعة:' : 'Attached Invoice Image:', 15, 20);
        pdf.addImage(imgData2, 'PNG', 10, 30, 190, 0);
      }
      
      // حفظ PDF
      pdf.save(`invoice-${invoice.invoiceNumber || invoice.id}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      // إزالة العنصر المؤقت
      document.body.removeChild(invoiceElement);
      
      showSuccessToast(language === "ar" ? "تم تصدير الفاتورة كـ PDF بنجاح" : "Invoice exported as PDF successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      showErrorToast(language === "ar" ? "فشل في تصدير PDF" : "Failed to export PDF");
    }
  };


  const handleDeleteInvoice = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!invoiceToDelete) return;

    try {
      await apiService.deleteInvoice(invoiceToDelete.id);
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceToDelete.id));
      showSuccessToast(language === "ar" ? "تم حذف الفاتورة بنجاح" : "Invoice deleted successfully");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      showErrorToast(language === "ar" ? "حدث خطأ أثناء حذف الفاتورة" : "An error occurred while deleting the invoice");
    } finally {
      setShowDeleteModal(false);
      setInvoiceToDelete(null);
    }
  };

  // 3. أضف مودال تعديل الفاتورة
  function EditInvoiceModal({ isOpen, invoice, onClose, onSave }: { isOpen: boolean; invoice: Invoice | null; onClose: () => void; onSave: (updated: Invoice) => void; }) {
    const { language } = useLanguage();
    const [formData, setFormData] = useState<Invoice | null>(invoice);
    useEffect(() => { setFormData(invoice); }, [invoice]);
    if (!isOpen || !formData) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">{language === "ar" ? "تعديل الفاتورة" : "Edit Invoice"}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-6 h-6" /></button>
          </div>
          <form onSubmit={e => { e.preventDefault(); onSave(formData); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{language === "ar" ? "رقم الفاتورة" : "Invoice Number"}</label>
              <input type="text" value={formData.invoiceNumber || ""} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{language === "ar" ? "اسم العميل" : "Customer"}</label>
              <input type="text" value={formData.customer || ""} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{language === "ar" ? "المبلغ" : "Amount"}</label>
              <input type="number" value={formData.amount || ""} onChange={e => setFormData(f => f ? { ...f, amount: Number(e.target.value) } : f)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{language === "ar" ? "تاريخ الفاتورة" : "Date"}</label>
              <input type="date" value={formData.date || ""} onChange={e => setFormData(f => f ? { ...f, date: e.target.value } : f)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{language === "ar" ? "تاريخ الاستحقاق" : "Due Date"}</label>
              <input type="date" value={formData.dueDate || ""} onChange={e => setFormData(f => f ? { ...f, dueDate: e.target.value } : f)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{language === "ar" ? "الوصف" : "Description"}</label>
              <textarea value={formData.description || ""} onChange={e => setFormData(f => f ? { ...f, description: e.target.value } : f)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="flex space-x-3 pt-4 rtl:space-x-reverse">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">{language === "ar" ? "إلغاء" : "Cancel"}</button>
              <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">{language === "ar" ? "حفظ التعديلات" : "Save Changes"}</button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // 4. أضف منطق حفظ التعديلات
  const handleSaveEdit = async (updated: Invoice) => {
    try {
      await apiService.updateInvoice(updated.id, updated);
      setInvoices(prev => prev.map(inv => inv.id === updated.id ? { ...inv, ...updated } : inv));
      showSuccessToast(language === "ar" ? "تم تحديث الفاتورة بنجاح" : "Invoice updated successfully");
      setShowEditModal(false);
      setInvoiceToEdit(null);
    } catch (error) {
      showErrorToast(language === "ar" ? "فشل في تحديث الفاتورة" : "Failed to update invoice");
    }
  };

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
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Plus className="w-4 h-4" />
            <span>{language === "ar" ? "إنشاء فاتورة" : "Create Invoice"}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <p className="text-2xl font-bold text-gray-900">
                  <AnimatedCounter value={stat.value} />
                </p>
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
                className="pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
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
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">
                {language === "ar" ? "جميع الأنواع" : "All Types"}
              </option>
              <option value="sales">{language === "ar" ? "فاتورة مبيعات" : "Sales"}</option>
              <option value="purchase">{language === "ar" ? "فاتورة شراء" : "Purchase"}</option>
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
                    {invoice.invoiceNumber || invoice.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {invoice.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                      {(invoice.total || invoice.amount || 0).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={invoice.paymentStatus || invoice.status} language={language} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={() => handleViewInvoice(invoice)}
                        className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
                        title={language === "ar" ? "عرض التفاصيل" : "View Details"}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExportPDF(invoice)}
                        className="text-purple-600 hover:text-purple-800 p-1 rounded transition-colors"
                        title={language === "ar" ? "تصدير PDF" : "Export PDF"}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                        title={language === "ar" ? "تعديل" : "Edit"}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(invoice)}
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

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateInvoiceModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={fetchInvoices}
          />
        )}
        {showUploadModal && (
          <UploadInvoiceModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onSuccess={fetchInvoices}
          />
        )}
        {showDetailModal && (
          <InvoiceDetailModal
            invoice={selectedInvoice}
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedInvoice(null);
            }}
          />
        )}
        {showDeleteModal && (
          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setInvoiceToDelete(null);
            }}
            onConfirm={confirmDelete}
            invoiceNumber={invoiceToDelete?.invoiceNumber || invoiceToDelete?.id || ""}
          />
        )}
        {showEditModal && (
          <EditInvoiceModal isOpen={showEditModal} invoice={invoiceToEdit} onClose={() => { setShowEditModal(false); setInvoiceToEdit(null); }} onSave={handleSaveEdit} />
        )}
      </AnimatePresence>
    </div>
  );
}

// 3. عند الإنشاء، اجلب آخر رقم تسلسلي للفواتير
const getNextInvoiceNumber = (invoices: any[]) => {
  const numbers = invoices
    .map(inv => inv.invoiceNumber)
    .filter(Boolean)
    .map(num => parseInt((num || '').replace(/INV-/, '')))
    .filter(n => !isNaN(n));
  const max = numbers.length > 0 ? Math.max(...numbers) : 0;
  const next = (max + 1).toString().padStart(3, '0');
  return `INV-${next}`;
};
