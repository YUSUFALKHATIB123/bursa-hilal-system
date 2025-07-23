import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Building2 } from "lucide-react";
import { toast } from 'react-toastify';
import { useLanguage } from "../contexts/LanguageContext";
import apiService from "../services/api";

interface EditSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: any;
  onSave: () => void;
}

export default function EditSupplierModal({ isOpen, onClose, supplier, onSave }: EditSupplierModalProps) {
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    location: "",
    specialization: "",
    rating: "5",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || "",
        contact: supplier.contact || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        location: supplier.location || "",
        specialization: supplier.specialization || "",
        rating: supplier.rating?.toString() || "5",
        notes: supplier.notes || "",
      });
    }
  }, [supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiService.updateSupplier(supplier.id, formData);
      toast.success(t("updateSuccess") || "تم التعديل بنجاح!", {
        position: "top-center",
        autoClose: 3000,
      });
      onSave();
      onClose();
    } catch (error) {
      toast.error(t("errorOccurred") || "حدث خطأ!", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen || !supplier) return null;

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
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-primary to-green-secondary text-white">
              <div className="flex items-center space-x-3">
                <Building2 className="w-6 h-6" />
                <h2 className="text-xl font-bold">{t("editSupplier") || "تعديل مورد"}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "ar" ? "اسم الشركة" : "Company Name"} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  />
                </div>

                {/* Contact Person */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "ar" ? "اسم جهة الاتصال" : "Contact Person"} *
                  </label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "ar" ? "رقم الهاتف" : "Phone Number"} *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("emailAddress") || "البريد الإلكتروني"}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "ar" ? "الموقع" : "Location"}
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  />
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "ar" ? "التخصص" : "Specialization"}
                  </label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  >
                    <option value="">{t("selectSpecialization") || "اختر التخصص"}</option>
                    <option value="Cotton Manufacturing">{language === "ar" ? "تصنيع القطن" : "Cotton Manufacturing"}</option>
                    <option value="Silk Production">{language === "ar" ? "إنتاج الحرير" : "Silk Production"}</option>
                    <option value="Wool Processing">{language === "ar" ? "معالجة الصوف" : "Wool Processing"}</option>
                    <option value="Dyeing Services">{language === "ar" ? "خدمات الصباغة" : "Dyeing Services"}</option>
                    <option value="Finishing Services">{language === "ar" ? "خدمات التشطيب" : "Finishing Services"}</option>
                    <option value="Equipment Supplier">{language === "ar" ? "مورد معدات" : "Equipment Supplier"}</option>
                  </select>
                </div>

                {/* Service Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "ar" ? "التقييم المبدئي" : "Initial Rating"}
                  </label>
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  >
                    <option value="5">★★★★★ {language === "ar" ? "(5 نجوم)" : "(5 stars)"}</option>
                    <option value="4">★★★★☆ {language === "ar" ? "(4 نجوم)" : "(4 stars)"}</option>
                    <option value="3">★★★☆☆ {language === "ar" ? "(3 نجوم)" : "(3 stars)"}</option>
                    <option value="2">★★☆☆☆ {language === "ar" ? "(2 نجوم)" : "(2 stars)"}</option>
                    <option value="1">★☆☆☆☆ {language === "ar" ? "(نجمة واحدة)" : "(1 star)"}</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "ar" ? "ملاحظات إضافية" : "Additional Notes"}
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                  disabled={loading}
                >
                  <Save className="w-5 h-5" />
                  <span>{t("save") || "حفظ"}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  disabled={loading}
                >
                  {t("cancel") || "إلغاء"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 