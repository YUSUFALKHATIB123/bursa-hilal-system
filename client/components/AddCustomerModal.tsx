import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, User, Phone, Mail, MapPin } from "lucide-react";
import apiService from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";
import { toast } from 'react-toastify';
import LocationSelector from "./LocationSelector";

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerAdded?: () => void; // إضافة callback لتحديث القائمة
}

export default function AddCustomerModal({
  isOpen,
  onClose,
  onCustomerAdded,
}: AddCustomerModalProps) {
  const { language, t } = useLanguage();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    location: "",
    country: "",
    province: "",
    type: "retail",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    
    try {
      // التحقق من صحة البيانات
      if (!formData.name.trim() || !formData.phone.trim()) {
        setSubmitError(
          language === "ar" 
            ? "يرجى ملء الحقول المطلوبة (الاسم والهاتف)" 
            : "Please fill in the required fields (name and phone)"
        );
        return;
      }

      // إنشاء كائن العميل الجديد
      const newCustomer = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim(),
        email: formData.email.trim(),
        address: formData.location.trim(),
        country: formData.country,
        province: formData.province,
        notes: formData.notes.trim(),
      };

      // إرسال البيانات للخادم
      const response = await apiService.createCustomer(newCustomer);
      
      console.log("تم إنشاء العميل بنجاح:", response);
      
      // إعادة تعيين النموذج
      setFormData({
        name: "",
        phone: "",
        whatsapp: "",
        email: "",
        location: "",
        country: "",
        province: "",
        type: "retail",
        notes: "",
      });
      
      // إغلاق النافذة وتحديث القائمة
      onClose();
      if (onCustomerAdded) {
        onCustomerAdded();
      }
      
      // عرض رسالة نجاح
      setTimeout(() => {
        const successMessage = language === "ar"
          ? `✅ تم إضافة العميل بنجاح!\n\nالاسم: ${response.name}\nالهاتف: ${response.phone}`
          : `✅ Customer added successfully!\n\nName: ${response.name}\nPhone: ${response.phone}`;
        toast.success(successMessage, {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }, 500);
      
    } catch (error: any) {
      console.error("خطأ في إنشاء العميل:", error);
      const errorMessage = language === "ar"
        ? "حدث خطأ أثناء إضافة العميل"
        : "An error occurred while adding the customer";
      setSubmitError(error.message || errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // معالجة تغيير الموقع من مكون LocationSelector
  const handleLocationChange = (location: {
    country: string;
    province: string;
    formattedAddress: string;
  }) => {
    setFormData({
      ...formData,
      country: location.country,
      province: location.province,
      location: location.formattedAddress,
    });
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
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-primary to-green-secondary text-white">
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6" />
                <h2 className="text-xl font-bold">
                  {language === "ar" ? "إضافة زبون جديد" : "Add New Customer"}
                </h2>
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
                {/* Customer Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "ar" ? "اسم الزبون *" : "Customer Name *"}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={language === "ar" ? "اسم الشركة أو العميل" : "Company or customer name"}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "ar" ? "رقم الهاتف *" : "Phone Number *"}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={language === "ar" ? "رقم الهاتف" : "Phone number"}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "ar" ? "رقم واتساب" : "WhatsApp Number"}
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder={language === "ar" ? "رقم واتساب (اختياري)" : "WhatsApp number (optional)"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "ar" ? "البريد الإلكتروني *" : "Email Address *"}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={language === "ar" ? "البريد الإلكتروني" : "Email address"}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  />
                </div>

                {/* Location Selector */}
                <div className="md:col-span-2">
                  <LocationSelector
                    onLocationChange={handleLocationChange}
                    initialCountry={formData.country}
                    initialProvince={formData.province}
                  />
                </div>

                {/* Customer Type */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "ar" ? "نوع الزبون" : "Customer Type"}
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  >
                    <option value="retail">
                      {language === "ar" ? "زبون تجزئة" : "Retail Customer"}
                    </option>
                    <option value="wholesale">
                      {language === "ar" ? "زبون جملة" : "Wholesale Customer"}
                    </option>
                    <option value="premium">
                      {language === "ar" ? "زبون مميز" : "Premium Customer"}
                    </option>
                    <option value="corporate">
                      {language === "ar" ? "عميل مؤسسي" : "Corporate Client"}
                    </option>
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
                  placeholder={language === "ar" ? "أي معلومات إضافية عن الزبون..." : "Any additional information about the customer..."}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent resize-none"
                />
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {submitError}
                </div>
              )}

              {/* Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>
                    {isSubmitting 
                      ? (language === "ar" ? "جاري الإضافة..." : "Adding...") 
                      : (language === "ar" ? "إضافة زبون" : "Add Customer")
                    }
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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
