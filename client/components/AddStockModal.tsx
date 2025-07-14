import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { X, Plus } from "lucide-react";
import { toast } from 'react-toastify';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddStockModal({ isOpen, onClose }: AddStockModalProps) {
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState({
    type: "",
    color: "",
    quantity: "",
    unitPrice: "",
    location: "",
    supplier: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding stock:", formData);
    // Here would be the actual API call
    toast.success(t("addSuccess"), {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    onClose();
    setFormData({
      type: "",
      color: "",
      quantity: "",
      unitPrice: "",
      location: "",
      supplier: "",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-primary to-green-secondary text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{t("addStock")}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("fabricType")}
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
            >
              <option value="">
                {language === "ar" ? "اختر نوع القماش" : "Select fabric type"}
              </option>
              <option value="Jacquard">{t("jacquard")}</option>
              <option value="Velvet">{t("velvet")}</option>
              <option value="Nubuk">{t("nubuk")}</option>
              <option value="Babyface">{t("babyface")}</option>
              <option value="Bouclé">{t("boucle")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("color")}
            </label>
            <select
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
            >
              <option value="">
                {language === "ar" ? "اختر اللون" : "Select color"}
              </option>
              <option value="White">{t("white")}</option>
              <option value="Black">{t("black")}</option>
              <option value="Red">{t("red")}</option>
              <option value="Blue">{t("blue")}</option>
              <option value="Green">{t("green")}</option>
              <option value="Yellow">{t("yellow")}</option>
              <option value="Brown">{t("brown")}</option>
              <option value="Gray">{t("gray")}</option>
              <option value="Beige">{t("beige")}</option>
              <option value="Cream">{t("cream")}</option>
              <option value="Gold">{t("gold")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("quantity")} ({t("meters")})
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              required
              min="1"
              placeholder={language === "ar" ? "أدخل الكمية" : "Enter quantity"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("price")} ({language === "ar" ? "لكل متر" : "per meter"})
            </label>
            <input
              type="number"
              name="unitPrice"
              value={formData.unitPrice}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              placeholder={language === "ar" ? "أدخل السعر" : "Enter price"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "ar" ? "المكان" : "Location"}
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
            >
              <option value="">
                {language === "ar" ? "اختر المكان" : "Select location"}
              </option>
              <option value="Warehouse A">
                {language === "ar" ? "مخزن أ" : "Warehouse A"}
              </option>
              <option value="Warehouse B">
                {language === "ar" ? "مخزن ب" : "Warehouse B"}
              </option>
              <option value="Production Floor">
                {language === "ar" ? "أرضية الإنتاج" : "Production Floor"}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "ar" ? "المورد" : "Supplier"}
            </label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleInputChange}
              placeholder={language === "ar" ? "اسم المورد" : "Supplier name"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t("addStock")}</span>
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
