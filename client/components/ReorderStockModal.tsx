import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { X, ShoppingCart, Calendar } from "lucide-react";

interface InventoryItem {
  id?: string;
  type: string;
  color: string;
  quantity: number;
  unit: string;
  price: number;
  location?: string;
  supplier?: string;
  minimumThreshold?: number;
}

interface ReorderStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export default function ReorderStockModal({
  isOpen,
  onClose,
  item,
}: ReorderStockModalProps) {
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState({
    quantity: "1000",
    urgency: "normal",
    expectedDelivery: "",
    supplier: item?.supplier || "",
    notes: "",
    orderType: "restock",
  });

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating reorder:", formData);
    // Here would be the actual API call to create reorder
    alert(
      language === "ar"
        ? "تم إنشاء طلب إعادة التموين بنجاح!"
        : "Reorder request created successfully!",
    );
    onClose();
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const recommendedQuantity = Math.max(
    item.minimumThreshold || 1000,
    item.quantity * 2,
  );
  const estimatedCost = parseInt(formData.quantity) * item.price;

  return (
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
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto"
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">
              {language === "ar" ? "إعادة طلب المخزون" : "Reorder Stock"}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-orange-100">
                {item.type} - {item.color}
              </p>
              <p className="text-sm text-orange-200">
                {language === "ar" ? "المتبقي حالياً" : "Current stock"}:{" "}
                {item.quantity} {t("meters")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-orange-200">
                {language === "ar" ? "الحد الأدنى" : "Min threshold"}
              </p>
              <p className="text-lg font-bold">
                {item.minimumThreshold || 1000} {t("meters")}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Status Alert */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ShoppingCart className="w-5 h-5 text-red-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  {language === "ar"
                    ? "تنبيه: مخزون منخفض"
                    : "Alert: Low Stock"}
                </p>
                <p className="text-xs text-red-600">
                  {language === "ar"
                    ? `هذا العنصر أقل من الحد الأدنى المطلوب (${item.minimumThreshold || 1000} متر)`
                    : `This item is below minimum threshold (${item.minimumThreshold || 1000} meters)`}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "ar" ? "كمية إعادة الطلب" : "Reorder Quantity"} (
              {t("meters")})
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              required
              min="1"
              placeholder={
                language === "ar"
                  ? "أدخل الكمية المطلوبة"
                  : "Enter quantity to order"
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {language === "ar" ? "الكمية المقترحة" : "Recommended"}:{" "}
              {recommendedQuantity} {t("meters")}
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    quantity: recommendedQuantity.toString(),
                  }))
                }
                className="ml-2 text-orange-600 hover:text-orange-700 underline"
              >
                {language === "ar" ? "استخدام المقترح" : "Use suggested"}
              </button>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "ar" ? "الأولوية" : "Urgency Level"}
            </label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="low">
                {language === "ar"
                  ? "منخفضة - عادي (7-14 يوم)"
                  : "Low - Normal (7-14 days)"}
              </option>
              <option value="normal">
                {language === "ar"
                  ? "متوسطة - سريع (3-7 أيام)"
                  : "Normal - Fast (3-7 days)"}
              </option>
              <option value="high">
                {language === "ar"
                  ? "عالية - عاجل (1-3 أيام)"
                  : "High - Urgent (1-3 days)"}
              </option>
              <option value="critical">
                {language === "ar"
                  ? "حرجة - فوري (نفس اليوم)"
                  : "Critical - Same day"}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "ar" ? "المورد المفضل" : "Preferred Supplier"}
            </label>
            <select
              name="supplier"
              value={formData.supplier}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">
                {language === "ar" ? "اختر المورد" : "Select supplier"}
              </option>
              <option value="Turkish Textile Co.">Turkish Textile Co.</option>
              <option value="Italian Fabrics Ltd.">Italian Fabrics Ltd.</option>
              <option value="Local Supplier 1">Local Supplier 1</option>
              <option value="Premium Textiles">Premium Textiles</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "ar"
                ? "التاريخ المتوقع للوصول"
                : "Expected Delivery Date"}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                name="expectedDelivery"
                value={formData.expectedDelivery}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "ar" ? "ملاحظات إضافية" : "Additional Notes"}
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder={
                language === "ar"
                  ? "أي متطلبات خاصة أو ملاحظات..."
                  : "Any special requirements or notes..."
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Cost Estimate */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              {language === "ar" ? "تقدير التكلفة" : "Cost Estimate"}
            </h4>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">
                {formData.quantity} {t("meters")} × ${item.price}
              </span>
              <span className="font-bold text-blue-800">
                ${estimatedCost.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div
            className={`flex ${language === "ar" ? "space-x-reverse space-x-3" : "space-x-3"} pt-4`}
          >
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>
                {language === "ar"
                  ? "إنشاء طلب إعادة التموين"
                  : "Create Reorder"}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
