import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Upload, FileText, Calendar, DollarSign } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useNotifications } from "../contexts/NotificationContext";
import { showSuccessToast, showErrorToast } from "../utils/toast";
import apiService from "../services/api";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated?: () => void; // إضافة callback لتحديث القائمة
}

interface UploadInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  onInvoiceCreated,
}: CreateInvoiceModalProps) {
  const { language, t } = useLanguage();
  const { notifyInvoiceCreated } = useNotifications();
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    customer: "",
    customerId: "",
    orderId: "",
    amount: "",
    dueDate: "",
    description: "",
    status: "unpaid",
    type: "sales",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // جلب العملاء والطلبات عند فتح المودال
  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchOrders();
    }
  }, [isOpen]);

  // فلترة الطلبات حسب العميل المحدد
  useEffect(() => {
    if (formData.customerId) {
      const customerOrders = orders.filter(order => 
        order.customer === formData.customer || 
        order.customerId === formData.customerId
      );
      setFilteredOrders(customerOrders);
    } else {
      setFilteredOrders([]);
    }
    // إعادة تعيين الطلب المحدد عند تغيير العميل
    setFormData(prev => ({ ...prev, orderId: "" }));
  }, [formData.customerId, formData.customer, orders]);

  const fetchCustomers = async () => {
    try {
      const customersData = await apiService.getCustomers();
      setCustomers(customersData);
    } catch (error) {
      console.error("خطأ في جلب العملاء:", error);
      showErrorToast(language === "ar" ? "خطأ في جلب بيانات العملاء" : "Error fetching customers");
    }
  };

  const fetchOrders = async () => {
    try {
      const ordersData = await apiService.getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error("خطأ في جلب الطلبات:", error);
      showErrorToast(language === "ar" ? "خطأ في جلب بيانات الطلبات" : "Error fetching orders");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    
    try {
      // التحقق من صحة البيانات
      if (!formData.customer.trim() || !formData.amount || !formData.dueDate) {
        setSubmitError(language === "ar" ? "يرجى ملء الحقول المطلوبة" : "Please fill in the required fields");
        return;
      }

      // البحث عن تفاصيل الطلب المحدد
      const selectedOrder = orders.find(order => order.id === formData.orderId);
      
      // إنشاء كائن الفاتورة الجديدة
      const newInvoice = {
        customer: formData.customer.trim(),
        customerId: formData.customerId,
        orderId: formData.orderId.trim(),
        orderDetails: selectedOrder ? {
          product: selectedOrder.product,
          quantity: selectedOrder.quantity,
          colors: selectedOrder.colors,
          deadline: selectedOrder.deadline
        } : null,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        description: formData.description.trim(),
        status: formData.status,
        type: formData.type,
        date: new Date().toISOString().split('T')[0]
      };

      // إرسال البيانات للخادم
      const response = await apiService.createInvoice(newInvoice);
      
      console.log("تم إنشاء الفاتورة بنجاح:", response);
      
      // إرسال إشعار إنشاء الفاتورة
      await notifyInvoiceCreated(
        response.id || response.invoiceNumber || `INV-${Date.now()}`,
        formData.customer,
        parseFloat(formData.amount)
      );
      
      // إعادة تعيين النموذج
      setFormData({
        customer: "",
        customerId: "",
        orderId: "",
        amount: "",
        dueDate: "",
        description: "",
        status: "unpaid",
        type: "sales",
      });
      
      // إغلاق النافذة وتحديث القائمة
      onClose();
      if (onInvoiceCreated) {
        onInvoiceCreated();
      }
      
      // عرض رسالة نجاح
      showSuccessToast(
        language === "ar" 
          ? `تم إنشاء الفاتورة بنجاح!\n\nرقم الفاتورة: ${response.id}\nالعميل: ${response.customer}\nالمبلغ: $${response.amount?.toLocaleString()}`
          : `Invoice created successfully!\n\nInvoice #: ${response.id}\nCustomer: ${response.customer}\nAmount: $${response.amount?.toLocaleString()}`
      );
      
    } catch (error: any) {
      console.error("خطأ في إنشاء الفاتورة:", error);
      setSubmitError(error.message || (language === "ar" ? "حدث خطأ أثناء إنشاء الفاتورة" : "Error creating invoice"));
      showErrorToast(language === "ar" ? "فشل في إنشاء الفاتورة" : "Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    
    // معالجة خاصة لتحديد العميل
    if (name === "customer") {
      const selectedCustomer = customers.find(customer => customer.name === value);
      setFormData({
        ...formData,
        customer: value,
        customerId: selectedCustomer ? selectedCustomer.id : "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-primary to-green-secondary text-white">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <FileText className="w-6 h-6" />
                <h2 className="text-xl font-bold">
                  {language === "ar" ? "إنشاء فاتورة جديدة" : "Create New Invoice"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{submitError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* اختيار العميل */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "ar" ? "العميل *" : "Customer *"}
                  </label>
                  <select
                    name="customer"
                    value={formData.customer}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  >
                    <option value="">
                      {language === "ar" ? "اختر العميل" : "Select Customer"}
                    </option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.name}>
                        {customer.name} ({customer.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* اختيار الطلب */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "ar" ? "الطلب (اختياري)" : "Order (Optional)"}
                  </label>
                  <select
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleChange}
                    disabled={!formData.customerId}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {language === "ar" 
                        ? (formData.customerId ? "اختر الطلب" : "اختر العميل أولاً") 
                        : (formData.customerId ? "Select Order" : "Select customer first")}
                    </option>
                    {filteredOrders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.id} - {order.product} ({order.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                {/* نوع الفاتورة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "ar" ? "نوع الفاتورة *" : "Invoice Type *"}
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  >
                    <option value="sales">
                      {language === "ar" ? "فاتورة مبيعات" : "Sales Invoice"}
                    </option>
                    <option value="purchase">
                      {language === "ar" ? "فاتورة شراء" : "Purchase Invoice"}
                    </option>
                  </select>
                </div>

                {/* المبلغ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "ar" ? "المبلغ *" : "Amount *"}
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    placeholder={language === "ar" ? "0.00" : "0.00"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  />
                </div>

                {/* تاريخ الاستحقاق */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "ar" ? "تاريخ الاستحقاق *" : "Due Date *"}
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  />
                </div>

                {/* حالة الدفع */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "ar" ? "حالة الدفع" : "Payment Status"}
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  >
                    <option value="unpaid">
                      {language === "ar" ? "غير مدفوع" : "Unpaid"}
                    </option>
                    <option value="partial">
                      {language === "ar" ? "مدفوع جزئياً" : "Partially Paid"}
                    </option>
                    <option value="paid">
                      {language === "ar" ? "مدفوع" : "Paid"}
                    </option>
                  </select>
                </div>
              </div>

              {/* الوصف */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "ar" ? "الوصف" : "Description"}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder={language === "ar" ? "اكتب وصف الفاتورة..." : "Enter invoice description..."}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent resize-none"
                />
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex justify-end space-x-4 rtl:space-x-reverse pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-primary hover:bg-green-secondary text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 rtl:space-x-reverse"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{language === "ar" ? "جارٍ الإنشاء..." : "Creating..."}</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>{language === "ar" ? "إنشاء الفاتورة" : "Create Invoice"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function UploadInvoiceModal({
  isOpen,
  onClose,
}: UploadInvoiceModalProps) {
  const { language } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showErrorToast(language === "ar" ? "يرجى اختيار ملف للرفع" : "Please select a file to upload");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // إرسال الملف للخادم
      const response = await fetch('http://localhost:3001/api/invoices/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      console.log("تم رفع الملف بنجاح:", result);
      
      showSuccessToast(
        language === "ar" 
          ? `تم رفع الفاتورة بنجاح!\nاسم الملف: ${file.name}`
          : `Invoice uploaded successfully!\nFile: ${file.name}`
      );
      
      onClose();
      setFile(null);
    } catch (error) {
      console.error("خطأ في رفع الملف:", error);
      showErrorToast(language === "ar" ? "فشل في رفع الملف" : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-primary to-green-secondary text-white">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Upload className="w-6 h-6" />
                <h2 className="text-xl font-bold">
                  {language === "ar" ? "رفع فاتورة" : "Upload Invoice"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-green-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                {file ? (
                  <div>
                    <p className="text-green-600 font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {language === "ar" ? "تم اختيار الملف" : "File selected"}
                    </p>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="mt-2 text-red-500 hover:text-red-700 text-sm"
                    >
                      {language === "ar" ? "إزالة الملف" : "Remove file"}
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">
                      {language === "ar" 
                        ? "اسحب ملف الفاتورة هنا أو" 
                        : "Drop invoice file here or"}
                    </p>
                    <label className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 cursor-pointer">
                      {language === "ar" ? "تصفح الملفات" : "Browse Files"}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      {language === "ar" 
                        ? "يدعم PDF, JPG, PNG, DOC" 
                        : "Supports PDF, JPG, PNG, DOC"}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-4 rtl:space-x-reverse mt-6">
                <button
                  type="submit"
                  disabled={!file || isUploading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{language === "ar" ? "جارٍ الرفع..." : "Uploading..."}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>{language === "ar" ? "رفع الفاتورة" : "Upload Invoice"}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isUploading}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
