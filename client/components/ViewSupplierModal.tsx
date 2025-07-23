import { motion, AnimatePresence } from "framer-motion";
import { X, Building2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface ViewSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: any;
}

export default function ViewSupplierModal({ isOpen, onClose, supplier }: ViewSupplierModalProps) {
  const { language, t } = useLanguage();
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
                <h2 className="text-xl font-bold">{t("supplierDetails") || "تفاصيل المورد"}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details */}
            <div className="p-6 space-y-4 text-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="font-semibold">{language === "ar" ? "اسم الشركة" : "Company Name"}:</span>
                  <div>{supplier.name}</div>
                </div>
                <div>
                  <span className="font-semibold">{language === "ar" ? "اسم جهة الاتصال" : "Contact Person"}:</span>
                  <div>{supplier.contact}</div>
                </div>
                <div>
                  <span className="font-semibold">{language === "ar" ? "رقم الهاتف" : "Phone Number"}:</span>
                  <div>{supplier.phone}</div>
                </div>
                <div>
                  <span className="font-semibold">{t("emailAddress") || "البريد الإلكتروني"}:</span>
                  <div>{supplier.email}</div>
                </div>
                <div>
                  <span className="font-semibold">{language === "ar" ? "الموقع" : "Location"}:</span>
                  <div>{supplier.location}</div>
                </div>
                <div>
                  <span className="font-semibold">{language === "ar" ? "التخصص" : "Specialization"}:</span>
                  <div>{supplier.specialization}</div>
                </div>
                <div>
                  <span className="font-semibold">{language === "ar" ? "التقييم" : "Rating"}:</span>
                  <div>{supplier.rating}</div>
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold">{language === "ar" ? "ملاحظات إضافية" : "Additional Notes"}:</span>
                  <div>{supplier.notes}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 