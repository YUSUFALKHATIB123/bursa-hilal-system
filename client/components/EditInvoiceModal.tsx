import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { X, Save, FileText, Calendar, DollarSign, User } from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  date: string;
  dueDate: string;
  total: number;
  amountRemaining: number;
  paymentStatus: string;
  notes?: string;
}

interface EditInvoiceModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
}

const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onSave,
}) => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState<Invoice>({
    id: "",
    invoiceNumber: "",
    customer: "",
    date: "",
    dueDate: "",
    total: 0,
    amountRemaining: 0,
    paymentStatus: "unpaid",
    notes: "",
  });

  const paymentStatusOptions = [
    { value: "paid", label: { en: "Paid", ar: "مدفوع" } },
    {
      value: "partially_paid",
      label: { en: "Partially Paid", ar: "مدفوع جزئياً" },
    },
    { value: "unpaid", label: { en: "Unpaid", ar: "غير مدفوع" } },
  ];

  const customers = [
    "Libya Textile Co.",
    "Ahmed Textiles Ltd.",
    "National Fabrics",
    "Modern Textiles Inc.",
    "Al-Wehda Manufacturing",
    "Tripoli Textile Co.",
  ];

  useEffect(() => {
    if (invoice) {
      setFormData({
        ...invoice,
        notes: invoice.notes || "",
      });
    }
  }, [invoice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof Invoice, value: string | number) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate remaining amount based on status
      if (field === "paymentStatus" || field === "total") {
        if (updated.paymentStatus === "paid") {
          updated.amountRemaining = 0;
        } else if (updated.paymentStatus === "partially_paid") {
          updated.amountRemaining = updated.total * 0.5; // Example: 50% remaining
        } else {
          updated.amountRemaining = updated.total;
        }
      }

      return updated;
    });
  };

  if (!isOpen || !invoice) return null;

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
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {language === "ar" ? "تعديل الفاتورة" : "Edit Invoice"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {formData.invoiceNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Invoice Number (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "ar" ? "رقم الفاتورة" : "Invoice Number"}
              </label>
              <input
                type="text"
                value={formData.invoiceNumber}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Customer */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                <span>{language === "ar" ? "العميل" : "Customer"}</span>
              </label>
              <select
                value={formData.customer}
                onChange={(e) => handleChange("customer", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              >
                {customers.map((customer) => (
                  <option key={customer} value={customer}>
                    {customer}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {language === "ar" ? "تاريخ الفاتورة" : "Invoice Date"}
                  </span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {language === "ar" ? "تاريخ الاستحقاق" : "Due Date"}
                  </span>
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange("dueDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "ar" ? "حالة الدفع" : "Payment Status"}
              </label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => handleChange("paymentStatus", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                {paymentStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label[language]}
                  </option>
                ))}
              </select>
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span>
                    {language === "ar" ? "المبلغ الإجمالي" : "Total Amount"}
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.total}
                    onChange={(e) =>
                      handleChange("total", Number(e.target.value))
                    }
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span>
                    {language === "ar" ? "المبلغ المتبقي" : "Remaining Amount"}
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.amountRemaining}
                    onChange={(e) =>
                      handleChange("amountRemaining", Number(e.target.value))
                    }
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="0.00"
                    min="0"
                    max={formData.total}
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                <span>{language === "ar" ? "الملاحظات" : "Notes"}</span>
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                placeholder={
                  language === "ar"
                    ? "أضف ملاحظات إضافية..."
                    : "Add additional notes..."
                }
              />
            </div>

            {/* Summary Card */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {language === "ar" ? "ملخص الفاتورة" : "Invoice Summary"}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">
                    {language === "ar" ? "إجمالي المبلغ:" : "Total Amount:"}
                  </span>
                  <span className="font-medium text-gray-900 ml-2">
                    ${formData.total.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">
                    {language === "ar" ? "المبلغ المتبقي:" : "Remaining:"}
                  </span>
                  <span className="font-medium text-gray-900 ml-2">
                    ${formData.amountRemaining.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">
                    {language === "ar" ? "المبلغ المدفوع:" : "Paid Amount:"}
                  </span>
                  <span className="font-medium text-green-600 ml-2">
                    $
                    {(
                      formData.total - formData.amountRemaining
                    ).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">
                    {language === "ar" ? "الحالة:" : "Status:"}
                  </span>
                  <span
                    className={`font-medium ml-2 ${
                      formData.paymentStatus === "paid"
                        ? "text-green-600"
                        : formData.paymentStatus === "partially_paid"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {
                      paymentStatusOptions.find(
                        (opt) => opt.value === formData.paymentStatus,
                      )?.label[language]
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                <span>
                  {language === "ar" ? "حفظ التغييرات" : "Save Changes"}
                </span>
              </motion.button>
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditInvoiceModal;
