import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import AddSupplierModal from "../components/AddSupplierModal";
import EditSupplierModal from "../components/EditSupplierModal";
import ViewSupplierModal from "../components/ViewSupplierModal";
import ConfirmationModal from "../components/ConfirmationModal";
import { Building2, Plus, Star, Upload, Eye, Edit, Trash2 } from "lucide-react";
import apiService from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Suppliers() {
  const { language, t } = useLanguage();
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  // جلب الموردين عند تحميل الصفحة
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await apiService.getSuppliers();
      setSuppliers(data);
    } catch (error) {
      // يمكن عرض رسالة خطأ هنا
    } finally {
      setLoading(false);
    }
  };

  // عند إغلاق نافذة الإضافة، أعد جلب الموردين
  const handleCloseAddModal = () => {
    setShowAddSupplierModal(false);
    fetchSuppliers();
  };

  // فتح مودال التعديل
  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setShowEditModal(true);
  };
  // فتح مودال المشاهدة
  const handleView = (supplier) => {
    setSelectedSupplier(supplier);
    setShowViewModal(true);
  };
  // فتح تأكيد الحذف
  const handleDelete = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDeleteConfirm(true);
  };

  // حذف المورد
  const handleConfirmDelete = async () => {
    if (!selectedSupplier) return;
    try {
      await apiService.deleteSupplier(selectedSupplier.id);
      setShowDeleteConfirm(false);
      setSelectedSupplier(null);
      fetchSuppliers();
    } catch (error) {
      // يمكن عرض رسالة خطأ هنا
    }
  };

  // دالة لحساب عدد الفواتير وتاريخ آخر تحديث
  const getSupplierStats = (supplier) => {
    const invoices = Array.isArray(supplier.invoices) ? supplier.invoices : [];
    const count = invoices.length;
    let lastDate = supplier.updatedAt;
    if (count > 0) {
      // استخدم تاريخ آخر فاتورة
      const lastInvoice = invoices[invoices.length - 1];
      lastDate = lastInvoice.date;
    }
    return { count, lastDate };
  };

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

      {/* العنوان والوصف الأوسط */}
      {(!loading && suppliers.length === 0) && (
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
      )}

      {/* Add Supplier Modal */}
      <AddSupplierModal
        isOpen={showAddSupplierModal}
        onClose={handleCloseAddModal}
      />

      {/* بطاقات الموردين */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {loading ? (
          <div className="col-span-full text-center py-8">{t("loading") || "جاري التحميل..."}</div>
        ) : suppliers.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">{t("noSuppliers") || "لا يوجد موردون"}</div>
        ) : (
          suppliers.map((supplier) => {
            const { count, lastDate } = getSupplierStats(supplier);
            return (
              <div key={supplier.id} className="bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-green-900 mb-2">{supplier.name}</h2>
                </div>
                <div className="flex flex-col gap-1 text-sm text-gray-700 mb-2">
                  <div>
                    {language === "ar"
                      ? `${count} فاتورة`
                      : `${count} invoice${count !== 1 ? 's' : ''}`}
                  </div>
                  <div>
                    {language === "ar"
                      ? `آخر تحديث: ${lastDate ? new Date(lastDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : '---'}`
                      : `Last update: ${lastDate ? new Date(lastDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '---'}`}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/suppliers/${supplier.id}`)}
                  className="mt-auto px-4 py-2 bg-green-primary text-white rounded-lg hover:bg-green-secondary transition-colors font-medium"
                >
                  {language === "ar" ? "عرض التفاصيل" : "View Details"}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* مودال التعديل */}
      <EditSupplierModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        supplier={selectedSupplier}
        onSave={fetchSuppliers}
      />
      {/* مودال المشاهدة */}
      <ViewSupplierModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        supplier={selectedSupplier}
      />
      {/* مودال تأكيد الحذف */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title={language === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
        message={language === "ar" ? `هل أنت متأكد أنك تريد حذف المورد "${selectedSupplier?.name}"؟ لا يمكن التراجع عن هذا الإجراء.` : `Are you sure you want to delete supplier "${selectedSupplier?.name}"? This action cannot be undone.`}
        confirmText={language === "ar" ? "حذف" : "Delete"}
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
      />
    </div>
  );
}
