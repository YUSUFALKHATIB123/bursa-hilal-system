import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import AddSupplierModal from "../components/AddSupplierModal";
import { Building2, Plus, Star, Upload } from "lucide-react";

export default function Suppliers() {
  const { language, t } = useLanguage();
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);

  return (
    <div className="space-y-6">
      <nav className="flex text-sm text-gray-500">
        <span>{t("dashboard")}</span>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{t("suppliers")}</span>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("suppliers")}</h1>
          <p className="text-gray-600 mt-1">{t("suppliersDesc")}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddSupplierModal(true)}
          className="mt-4 sm:mt-0 px-4 py-2 bg-green-primary text-white rounded-lg hover:bg-green-secondary transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t("addSupplier")}</span>
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-12 text-center"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {language === "ar" ? "إدارة الموردين" : "Supplier Management"}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {language === "ar"
            ? "إدارة المصانع الخارجية مع مرفقات الملفات والصور وتقييمات جودة الخدمة."
            : "External factory management, file attachments, photos, and service quality ratings."}
        </p>
      </motion.div>

      {/* Add Supplier Modal */}
      <AddSupplierModal
        isOpen={showAddSupplierModal}
        onClose={() => setShowAddSupplierModal(false)}
      />
    </div>
  );
}
