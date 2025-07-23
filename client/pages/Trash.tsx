import { useEffect, useState } from "react";
import apiService from "../services/api";
import { Trash2, RotateCcw, XCircle } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function Trash() {
  const { language, t } = useLanguage();
  const [deletedSuppliers, setDeletedSuppliers] = useState([]);
  const [deletedEmployees, setDeletedEmployees] = useState([]);
  const [deletedInvoices, setDeletedInvoices] = useState([]);
  const [deletedInventory, setDeletedInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{type: string, id: string}|null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiService.getSuppliers(),
      apiService.getEmployees(),
      apiService.getInvoices(),
      apiService.getInventory()
    ]).then(([sup, emp, inv, invt]) => {
      setDeletedSuppliers(sup.filter((s: any) => s.isDeleted));
      setDeletedEmployees(emp.filter((e: any) => e.isDeleted));
      setDeletedInvoices(inv.filter((i: any) => i.isDeleted));
      setDeletedInventory(invt.filter((i: any) => i.isDeleted));
    }).finally(() => setLoading(false));
  }, [refresh]);

  const handleRestore = async (type: string, id: string) => {
    if (type === 'supplier') await apiService.updateSupplier(id, { isDeleted: false });
    if (type === 'employee') await apiService.updateEmployee(id, { isDeleted: false });
    if (type === 'invoice') await apiService.updateInvoice(id, { isDeleted: false });
    if (type === 'inventory') await apiService.updateInventoryItem(id, { isDeleted: false });
    setRefresh(r => r + 1);
  };
  const handleDelete = async (type: string, id: string) => {
    if (type === 'supplier') await apiService.deleteSupplier(id); // حذف نهائي
    if (type === 'employee') await apiService.deleteEmployee(id);
    if (type === 'invoice') await apiService.deleteInvoice(id);
    if (type === 'inventory') await apiService.deleteInventoryItem(id);
    setConfirm(null);
    setRefresh(r => r + 1);
  };

  const all = [
    ...deletedSuppliers.map((s: any) => ({ id: s.id, name: s.name, type: 'supplier', deletedAt: s.deletedAt || '', raw: s })),
    ...deletedEmployees.map((e: any) => ({ id: e.id, name: e.name, type: 'employee', deletedAt: e.deletedAt || '', raw: e })),
    ...deletedInvoices.map((i: any) => ({ id: i.id, name: i.invoiceNumber || i.id, type: 'invoice', deletedAt: i.deletedAt || '', raw: i })),
    ...deletedInventory.map((i: any) => ({ id: i.id, name: i.name, type: 'inventory', deletedAt: i.deletedAt || '', raw: i })),
  ];

  // ترجمة الأنواع
  const typeLabel = (type: string) => {
    if (type === 'supplier') return language === 'ar' ? 'مورد' : 'Supplier';
    if (type === 'employee') return language === 'ar' ? 'موظف' : 'Employee';
    if (type === 'invoice') return language === 'ar' ? 'فاتورة' : 'Invoice';
    if (type === 'inventory') return language === 'ar' ? 'مخزون' : 'Inventory';
    return type;
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Trash2 className="w-6 h-6" />
        {language === 'ar' ? 'سلة المهملات' : 'Trash'}
      </h1>
      {loading ? (
        <div>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
      ) : all.length === 0 ? (
        <div className="text-gray-500">{language === 'ar' ? 'لا توجد عناصر محذوفة' : 'No deleted items'}</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 text-sm bg-white rounded-xl shadow font-sans not-italic font-normal">
          <thead>
            <tr>
              <th className="px-4 py-2 text-center font-sans not-italic font-normal">{language === 'ar' ? 'النوع' : 'Type'}</th>
              <th className="px-4 py-2 text-center font-sans not-italic font-normal">{language === 'ar' ? 'الاسم/الوصف' : 'Name/Description'}</th>
              <th className="px-4 py-2 text-center font-sans not-italic font-normal">{language === 'ar' ? 'تاريخ الحذف' : 'Deleted At'}</th>
              <th className="px-4 py-2 text-center font-sans not-italic font-normal">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {all.map(item => (
              <tr key={item.type + '-' + item.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 not-italic font-normal font-sans text-center">{typeLabel(item.type)}</td>
                <td className="px-4 py-2 not-italic font-normal font-sans text-center">
                  {item.name}
                </td>
                <td className="px-4 py-2 not-italic font-normal font-sans text-center">{item.deletedAt ? new Date(item.deletedAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '-'}</td>
                <td className="px-4 py-2 flex gap-2 justify-center items-center not-italic font-normal font-sans text-center">
                  <button onClick={() => handleRestore(item.type, item.id)} className="p-1 rounded hover:bg-green-100" title={language === 'ar' ? 'استرجاع' : 'Restore'}><RotateCcw className="w-5 h-5 text-green-700" /></button>
                  <button onClick={() => setConfirm({ type: item.type, id: item.id })} className="p-1 rounded hover:bg-red-100" title={language === 'ar' ? 'حذف نهائي' : 'Delete Permanently'}><XCircle className="w-5 h-5 text-red-700" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* إشعار تأكيد الحذف النهائي */}
      {confirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center gap-4 border border-gray-200">
            <XCircle className="w-10 h-10 text-red-600" />
            <div className="text-lg font-bold text-red-700">{language === 'ar' ? 'تأكيد الحذف النهائي' : 'Delete Confirmation'}</div>
            <div className="text-gray-700 text-center">{language === 'ar' ? 'هل أنت متأكد أنك تريد حذف هذا العنصر نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to permanently delete this item? This action cannot be undone.'}</div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => handleDelete(confirm.type, confirm.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold">{language === 'ar' ? 'حذف نهائي' : 'Delete Permanently'}</button>
              <button onClick={() => setConfirm(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">{language === 'ar' ? 'إلغاء' : 'Cancel'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 