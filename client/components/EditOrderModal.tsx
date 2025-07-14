import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { X, Save, Calendar, User, Package, FileText } from "lucide-react";
import { toast } from 'react-toastify';

interface Order {
  id: string;
  customer: string;
  status: string;
  total: number;
  date: string;
  deadline: string;
  items?: string;
  product?: string;
  colors?: string;
  quantity?: number;
  notes?: string;
}

interface EditOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Order) => void;
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onSave,
}) => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState<Order>({
    id: "",
    customer: "",
    status: "processing",
    total: 0,
    date: "",
    deadline: "",
    items: "",
    product: "",
    colors: "",
    quantity: 0,
    notes: "",
  });

  const statusOptions = [
    { value: "processing", label: { en: "Processing", ar: "قيد المعالجة" } },
    { value: "completed", label: { en: "Completed", ar: "مكتمل" } },
    { value: "pending", label: { en: "Pending", ar: "معلق" } },
    { value: "cancelled", label: { en: "Cancelled", ar: "ملغي" } },
  ];

  useEffect(() => {
    if (order) {
      setFormData({
        ...order,
        items: order.items || "",
        quantity: order.quantity || 0,
        notes: order.notes || "",
      });
    }
  }, [order]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (field: keyof Order, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen || !order) return null;

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
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {language === "ar" ? "تعديل الطلب" : "Edit Order"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {language === "ar" ? `الطلب رقم:` : "Order ID:"} {order.id}
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
            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  <span>{language === "ar" ? "العميل" : "Customer"}</span>
                </label>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={(e) => handleChange("customer", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent transition-colors"
                  placeholder={
                    language === "ar" ? "اسم العميل" : "Customer name"
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "ar" ? "الحالة" : "Status"}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent transition-colors"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label[language]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Package className="w-4 h-4" />
                  <span>{language === "ar" ? "نوع القماش" : "Product Type"}</span>
                </label>
                <input
                  type="text"
                  value={formData.product}
                  onChange={(e) => handleChange("product", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent transition-colors"
                  placeholder={
                    language === "ar" ? "مثل: Jacquard Velvet" : "e.g., Jacquard Velvet"
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "ar" ? "الألوان" : "Colors"}
                </label>
                <input
                  type="text"
                  value={formData.colors}
                  onChange={(e) => handleChange("colors", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent transition-colors"
                  placeholder={
                    language === "ar" ? "مثل: أحمر، أزرق، أصفر" : "e.g., Red, Blue, Yellow"
                  }
                />
              </div>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "ar" ? "الكمية" : "Quantity"}
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleChange("quantity", Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent transition-colors"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "ar" ? "المبلغ الإجمالي" : "Total Amount"}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.total}
                    onChange={(e) =>
                      handleChange("total", Number(e.target.value))
                    }
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent transition-colors"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "ar" ? "العناصر" : "Items"}
                </label>
                <input
                  type="text"
                  value={formData.items}
                  onChange={(e) => handleChange("items", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent transition-colors"
                  placeholder={
                    language === "ar" ? "وصف العناصر" : "Item description"
                  }
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {language === "ar" ? "تاريخ الطلب" : "Order Date"}
                  </span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {language === "ar" ? "الموعد النهائي" : "Deadline"}
                  </span>
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleChange("deadline", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent transition-colors"
                  required
                />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent transition-colors resize-none"
                placeholder={
                  language === "ar"
                    ? "أضف ملاحظات إضافية..."
                    : "Add additional notes..."
                }
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center space-x-2 bg-green-primary text-white py-3 rounded-lg hover:bg-green-secondary transition-colors font-medium"
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

export default EditOrderModal;
