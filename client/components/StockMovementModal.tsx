import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { showSuccessToast, showErrorToast } from "../utils/toast";
import apiService from "../services/api";
import { X, Plus, Minus, Calendar, Package } from "lucide-react";

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  operation: "in" | "out";
}

interface InventoryItem {
  id: string;
  type: string;
  color: string;
  quantity: number;
  unit: string;
  price: number;
  location?: string;
  supplier?: string;
  lastRestocked?: string;
  minimumThreshold?: number;
}

export default function StockMovementModal({ 
  isOpen, 
  onClose, 
  item, 
  operation 
}: StockMovementModalProps) {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    color: "",
    quantity: "",
    notes: "",
    date: new Date().toISOString().split('T')[0]
  });

  // تحديث البيانات عند فتح النموذج
  useEffect(() => {
    if (isOpen && item) {
      setFormData({
        type: item.type,
        color: item.color,
        quantity: "",
        notes: "",
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [isOpen, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      showErrorToast(language === "ar" ? "يرجى إدخال كمية صحيحة" : "Please enter a valid quantity");
      return;
    }

    if (operation === "out" && parseFloat(formData.quantity) > item.quantity) {
      showErrorToast(language === "ar" ? "الكمية المطلوبة أكبر من الكمية المتوفرة" : "Requested quantity exceeds available stock");
      return;
    }

    try {
      setLoading(true);
      
      const quantity = parseFloat(formData.quantity);

      // استخدام API الجديد لمعالجة حركة المخزون
      const result = await apiService.processStockMovement(item.id, {
        operation: operation,
        quantity: quantity,
        notes: formData.notes,
        date: formData.date,
        user: "admin" // يمكن تغييرها لاحقاً لاستخدام المستخدم الحالي
      });

      console.log("Stock movement processed:", result);

      showSuccessToast(
        language === "ar" 
          ? `تم ${operation === "in" ? "إضافة" : "إخراج"} الكمية بنجاح`
          : `Quantity ${operation === "in" ? "added" : "removed"} successfully`
      );

      onClose();
    } catch (error) {
      console.error("Error updating stock:", error);
      showErrorToast(
        language === "ar" 
          ? "حدث خطأ أثناء تحديث المخزون"
          : "An error occurred while updating stock"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-lg shadow-xl w-full max-w-sm mx-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className={`p-2 rounded-lg ${operation === "in" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                  {operation === "in" ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {operation === "in" 
                      ? (language === "ar" ? "إدخال كمية" : "Add Stock")
                      : (language === "ar" ? "إخراج كمية" : "Remove Stock")
                    }
                  </h2>
                  <p className="text-sm text-gray-600">
                    {item?.type} - {item?.color}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              {/* نوع القماش */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "ar" ? "نوع القماش" : "Fabric Type"}
                </label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  disabled
                />
              </div>

              {/* اللون */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "ar" ? "اللون" : "Color"}
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  disabled
                />
              </div>

              {/* الكمية الحالية */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "ar" ? "الكمية الحالية" : "Current Quantity"}
                </label>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 font-medium text-sm">
                    {item?.quantity?.toLocaleString()} {language === "ar" ? "متر" : "meters"}
                  </span>
                </div>
              </div>

              {/* الكمية */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "ar" ? "الكمية" : "Quantity"}
                  <span className="text-red-500"> *</span>
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder={language === "ar" ? "أدخل الكمية" : "Enter quantity"}
                  min="0"
                  step="0.01"
                  required
                />
                {operation === "out" && item && (
                  <p className="text-xs text-gray-500 mt-1">
                    {language === "ar" ? "الحد الأقصى:" : "Maximum:"} {item.quantity} {language === "ar" ? "متر" : "meters"}
                  </p>
                )}
              </div>

              {/* التاريخ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "ar" ? "التاريخ" : "Date"}
                </label>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              {/* الملاحظات */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "ar" ? "السبب أو الملاحظات" : "Reason or Notes"}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  rows={2}
                  placeholder={language === "ar" ? "أدخل السبب أو الملاحظات..." : "Enter reason or notes..."}
                />
              </div>

              {/* ملخص العملية */}
              {formData.quantity && (
                <div className={`p-2 rounded-lg ${operation === "in" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                  <p className="text-xs font-medium">
                    {language === "ar" ? "الكمية الجديدة:" : "New quantity:"}
                  </p>
                  <p className={`text-sm font-bold ${operation === "in" ? "text-green-600" : "text-red-600"}`}>
                    {item ? (operation === "in" ? item.quantity + parseFloat(formData.quantity) : item.quantity - parseFloat(formData.quantity)).toLocaleString() : 0} {language === "ar" ? "متر" : "meters"}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex space-x-3 rtl:space-x-reverse pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-3 py-2 text-white rounded-lg transition-colors disabled:opacity-50 text-sm ${
                    operation === "in" 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1 rtl:ml-1 rtl:mr-0"></div>
                      {language === "ar" ? "جاري..." : "Processing..."}
                    </div>
                  ) : (
                    operation === "in" 
                      ? (language === "ar" ? "إضافة الكمية" : "Add Quantity")
                      : (language === "ar" ? "إخراج الكمية" : "Remove Quantity")
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 