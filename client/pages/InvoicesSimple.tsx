import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { Plus, Upload, FileText } from "lucide-react";

export default function Invoices() {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // محاكاة تحميل البيانات
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {language === "ar" ? "الفواتير" : "Invoices"}
        </h1>
        <p className="text-gray-600">
          {language === "ar" 
            ? "نظام إدارة الفواتير يعمل بنجاح!" 
            : "Invoice management system is working!"
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {language === "ar" ? "إجمالي الفواتير" : "Total Invoices"}
              </h3>
              <p className="text-3xl font-bold text-green-600">24</p>
            </div>
            <FileText className="w-10 h-10 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {language === "ar" ? "فواتير مدفوعة" : "Paid Invoices"}
              </h3>
              <p className="text-3xl font-bold text-blue-600">18</p>
            </div>
            <Plus className="w-10 h-10 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {language === "ar" ? "فواتير معلقة" : "Pending Invoices"}
              </h3>
              <p className="text-3xl font-bold text-red-600">6</p>
            </div>
            <Upload className="w-10 h-10 text-red-600" />
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {language === "ar" ? "إجراءات سريعة" : "Quick Actions"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Plus className="w-5 h-5 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">
              {language === "ar" ? "إنشاء فاتورة جديدة" : "Create New Invoice"}
            </h3>
            <p className="text-sm text-gray-600">
              {language === "ar" ? "أنشئ فاتورة جديدة للعملاء" : "Create a new invoice for customers"}
            </p>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Upload className="w-5 h-5 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">
              {language === "ar" ? "رفع فاتورة" : "Upload Invoice"}
            </h3>
            <p className="text-sm text-gray-600">
              {language === "ar" ? "ارفع ملفات الفواتير الموجودة" : "Upload existing invoice files"}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
