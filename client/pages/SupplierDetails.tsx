import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import apiService from "../services/api";
import { showSuccessToast, showErrorToast } from "../utils/toast";

export default function SupplierDetails() {
  const { id } = useParams();
  const { language, t } = useLanguage();
  const [supplier, setSupplier] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [form, setForm] = useState({ date: "", pieces: "", quantity: "", notes: "", file: null });
  // استورد useState من React إذا لم يكن مستوردًا بالفعل
  // أضف حالة لإظهار Toast التأكيد:
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  // أضف حالة لإظهار بطاقة التفاصيل:
  const [viewedInvoice, setViewedInvoice] = useState<any>(null);
  // أضف حالة لإظهار بطاقة التعديل:
  const [editInvoice, setEditInvoice] = useState<any>(null);
  const [editForm, setEditForm] = useState({ date: '', pieces: '', quantity: '', notes: '' });
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchSupplier();
  }, [id]);

  const fetchSupplier = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/suppliers/${id}`);
      const data = await res.json();
      setSupplier(data);
      // جلب الفواتير
      const invRes = await fetch(`/api/suppliers/${id}/invoices`);
      const invData = await invRes.json();
      setInvoices(invData);
    } catch {
      setSupplier(null);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvoice = async (e: any) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const formData = new FormData();
      formData.append("date", form.date);
      formData.append("pieces", form.pieces || "0");
      formData.append("quantity", form.quantity);
      formData.append("notes", form.notes);
      if (form.file) formData.append("file", form.file);
      await fetch(`/api/suppliers/${id}/invoices`, {
        method: "POST",
        body: formData,
      });
      setShowAddInvoice(false);
      setForm({ date: "", pieces: "", quantity: "", notes: "", file: null });
      fetchSupplier();
    } finally {
      setAddLoading(false);
    }
  };

  // حساب الإحصائيات
  const invoiceStats = Array.isArray(invoices) && invoices.length > 0
    ? invoices.reduce((acc, inv) => {
        const pieces = Number(inv.pieces || 0);
        const meters = Number(inv.quantity || 0);
        acc.count += 1;
        acc.pieces += pieces;
        acc.meters += meters;
        return acc;
      }, { count: 0, pieces: 0, meters: 0 })
    : { count: 0, pieces: 0, meters: 0 };

  // أضف دالة حذف الفاتورة:
  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف الفاتورة؟' : 'Are you sure you want to delete this invoice?')) return;
    try {
      await fetch(`/api/suppliers/${id}/invoices/${invoiceId}`, { method: 'DELETE' });
      fetchSupplier();
    } catch {
      alert(language === 'ar' ? 'حدث خطأ أثناء الحذف' : 'Error deleting invoice');
    }
  };

  if (loading) return <div className="p-8 text-center">{t("loading") || "جاري التحميل..."}</div>;
  if (!supplier || !supplier.id || !supplier.name) {
    return <div className="p-8 text-center text-red-600">{t("notFound") || "المورد غير موجود"}</div>;
  }

  console.log('supplier', supplier, 'invoices', invoices);

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      {/* بيانات المورد + بطاقات الإحصائيات */}
      <div className="bg-white rounded-xl shadow p-6 border border-gray-200 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-green-900 mb-1">{supplier.name}</h1>
            <div className="text-gray-700 mb-1">{supplier.type || supplier.specialization}</div>
            <div className="text-gray-500 text-sm mb-1">{supplier.phone}</div>
            <div className="text-gray-500 text-sm mb-1">{supplier.location || supplier.address}</div>
            {supplier.email && <div className="text-gray-500 text-xs mb-1">{supplier.email}</div>}
            {supplier.notes && <div className="text-gray-500 text-xs mb-1">{supplier.notes}</div>}
          </div>
          {/* بطاقات الإحصائيات */}
          <div className="flex gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="bg-gray-50 rounded-xl px-6 py-4 flex flex-col items-center min-w-[120px]">
              <div className="text-xs text-gray-500 mb-1">{language === "ar" ? "عدد الفواتير" : "Total Invoices"}</div>
              <div className="text-2xl font-bold text-gray-900">{invoiceStats.count}</div>
            </div>
            <div className="bg-gray-50 rounded-xl px-6 py-4 flex flex-col items-center min-w-[120px]">
              <div className="text-xs text-gray-500 mb-1">{language === "ar" ? "عدد الأتواب" : "Total Pieces"}</div>
              <div className="text-2xl font-bold text-gray-900">{invoiceStats.pieces}</div>
            </div>
            <div className="bg-gray-50 rounded-xl px-6 py-4 flex flex-col items-center min-w-[120px]">
              <div className="text-xs text-gray-500 mb-1">{language === "ar" ? "الكمية (متر)" : "Total Meters"}</div>
              <div className="text-2xl font-bold text-gray-900">{invoiceStats.meters}</div>
            </div>
          </div>
        </div>
      </div>

      {/* جدول الفواتير */}
      <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-green-900">{language === "ar" ? "فواتير المورد" : "Supplier Invoices"}</h2>
          <button
            onClick={() => setShowAddInvoice(true)}
            className="px-4 py-2 bg-green-primary text-white rounded-lg hover:bg-green-secondary transition-colors font-medium"
          >
            {language === "ar" ? "+ إضافة فاتورة" : "+ Add Invoice"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2">{language === "ar" ? "التاريخ" : "Date"}</th>
                <th className="px-4 py-2">{language === "ar" ? "الكمية (أتواب)" : "Pieces"}</th>
                <th className="px-4 py-2">{language === "ar" ? "الإجمالي (متر)" : "Total (m)"}</th>
                <th className="px-4 py-2">{language === "ar" ? "الملاحظات" : "Notes"}</th>
                <th className="px-4 py-2">{language === "ar" ? "الفاتورة (ملف)" : "Invoice (File)"}</th>
                <th className="px-4 py-2">{language === "ar" ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {!Array.isArray(invoices) || invoices.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-400 py-4">{language === "ar" ? "لا توجد فواتير" : "No invoices"}</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{inv.date}</td>
                    <td className="px-4 py-2">{inv.pieces || 0}</td>
                    <td className="px-4 py-2">{inv.quantity || 0}</td>
                    <td className="px-4 py-2">{inv.notes}</td>
                    <td className="px-4 py-2">
                      {inv.file?.originalName ? (
                        <a href={`/api/suppliers/${supplier.id}/invoices/download/${inv.file.filename}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{inv.file.originalName}</a>
                      ) : (
                        <span className="text-gray-400">{language === "ar" ? "لا يوجد" : "None"}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <button className="p-1 rounded hover:bg-gray-100" title={language === 'ar' ? 'مشاهدة' : 'View'}
                        onClick={() => setViewedInvoice(inv)}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button className="p-1 rounded hover:bg-gray-100" title={language === 'ar' ? 'تعديل' : 'Edit'}
                        onClick={() => {
                          setEditInvoice(inv);
                          setEditForm({
                            date: inv.date || '',
                            pieces: inv.pieces || '',
                            quantity: inv.quantity || '',
                            notes: inv.notes || ''
                          });
                        }}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"/></svg>
                      </button>
                      <button className="p-1 rounded hover:bg-gray-100" title={language === 'ar' ? 'حذف' : 'Delete'}
                        onClick={() => setPendingDeleteId(inv.id)}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* نموذج إضافة فاتورة */}
      {showAddInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddInvoice}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-4 border border-gray-200"
            encType="multipart/form-data"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-2">{language === "ar" ? "إضافة فاتورة جديدة" : "Add New Invoice"}</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === "ar" ? "التاريخ" : "Date"}</label>
              <input type="date" required className="w-full px-3 py-2 border rounded-lg" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === "ar" ? "الكمية (أتواب)" : "Pieces"}</label>
              <input type="number" required min="0" className="w-full px-3 py-2 border rounded-lg" value={form.pieces || ""} onChange={e => setForm(f => ({ ...f, pieces: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === "ar" ? "الكمية (متر)" : "Quantity (m)"}</label>
              <input type="number" required min="0" className="w-full px-3 py-2 border rounded-lg" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === "ar" ? "الملاحظات" : "Notes"}</label>
              <textarea className="w-full px-3 py-2 border rounded-lg" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === "ar" ? "رفع ملف (PDF أو صورة)" : "Upload File (PDF or Image)"}</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" required onChange={e => setForm(f => ({ ...f, file: e.target.files?.[0] || null }))} />
            </div>
            <div className="flex gap-2 mt-2">
              <button type="submit" disabled={addLoading} className="flex-1 px-4 py-2 bg-green-primary text-white rounded-lg hover:bg-green-secondary transition-colors font-medium">{addLoading ? (language === "ar" ? "جاري الحفظ..." : "Saving...") : (language === "ar" ? "حفظ" : "Save")}</button>
              <button type="button" onClick={() => setShowAddInvoice(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">{language === "ar" ? "إلغاء" : "Cancel"}</button>
            </div>
          </form>
        </div>
      )}
      {pendingDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-6 flex flex-col items-center gap-4 border border-gray-200">
            <div className="text-lg font-bold text-red-700 mb-2">{language === 'ar' ? 'تأكيد الحذف' : 'Delete Confirmation'}</div>
            <div className="mb-4">{language === 'ar' ? 'هل أنت متأكد من حذف الفاتورة؟' : 'Are you sure you want to delete this invoice?'}</div>
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={async () => {
                await handleDeleteInvoice(pendingDeleteId);
                showErrorToast(language === 'ar' ? 'تم حذف الفاتورة بنجاح' : 'Invoice deleted successfully');
                setPendingDeleteId(null);
              }}>{language === 'ar' ? 'نعم، احذف' : 'Yes, Delete'}</button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300" onClick={() => setPendingDeleteId(null)}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</button>
            </div>
          </div>
        </div>
      )}
      {viewedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-6 min-w-[320px] max-w-xs w-full flex flex-col gap-4 border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <div className="text-lg font-bold text-green-900">{language === 'ar' ? 'تفاصيل الفاتورة' : 'Invoice Details'}</div>
              <button onClick={() => setViewedInvoice(null)} className="text-gray-500 hover:text-red-600 text-xl font-bold">×</button>
            </div>
            <div><b>{language === 'ar' ? 'التاريخ:' : 'Date:'}</b> {viewedInvoice.date}</div>
            <div><b>{language === 'ar' ? 'الكمية (أتواب):' : 'Pieces:'}</b> {viewedInvoice.pieces || 0}</div>
            <div><b>{language === 'ar' ? 'الكمية (متر):' : 'Quantity:'}</b> {viewedInvoice.quantity || 0}</div>
            <div><b>{language === 'ar' ? 'ملاحظات:' : 'Notes:'}</b> {viewedInvoice.notes || '-'}</div>
            {viewedInvoice.file?.originalName && (
              <div><b>{language === 'ar' ? 'الملف:' : 'File:'}</b> <a href={`/api/suppliers/${supplier.id}/invoices/download/${viewedInvoice.file.filename}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{viewedInvoice.file.originalName}</a></div>
            )}
          </div>
        </div>
      )}
      {editInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <form
            onSubmit={async e => {
              e.preventDefault();
              setEditLoading(true);
              try {
                await fetch(`/api/suppliers/${supplier.id}/invoices/${editInvoice.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(editForm)
                });
                setEditInvoice(null);
                fetchSupplier();
              } finally {
                setEditLoading(false);
              }
            }}
            className="bg-white rounded-xl shadow-xl p-6 min-w-[320px] max-w-xs w-full flex flex-col gap-4 border border-gray-200 items-center"
          >
            <div className="flex justify-between items-center w-full mb-2">
              <div className="text-lg font-bold text-yellow-700">{language === 'ar' ? 'تعديل الفاتورة' : 'Edit Invoice'}</div>
              <button type="button" onClick={() => setEditInvoice(null)} className="text-gray-500 hover:text-red-600 text-xl font-bold">×</button>
            </div>
            <div className="w-full flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 mb-1">{language === 'ar' ? 'التاريخ' : 'Date'}</label>
              <input type="date" required className="w-full px-3 py-2 border rounded-lg" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} />
              <label className="text-sm font-medium text-gray-700 mb-1">{language === 'ar' ? 'الكمية (أتواب)' : 'Pieces'}</label>
              <input type="number" required min="0" className="w-full px-3 py-2 border rounded-lg" value={editForm.pieces} onChange={e => setEditForm(f => ({ ...f, pieces: e.target.value }))} />
              <label className="text-sm font-medium text-gray-700 mb-1">{language === 'ar' ? 'الكمية (متر)' : 'Quantity (m)'}</label>
              <input type="number" required min="0" className="w-full px-3 py-2 border rounded-lg" value={editForm.quantity} onChange={e => setEditForm(f => ({ ...f, quantity: e.target.value }))} />
              <label className="text-sm font-medium text-gray-700 mb-1">{language === 'ar' ? 'الملاحظات' : 'Notes'}</label>
              <textarea className="w-full px-3 py-2 border rounded-lg" value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="flex gap-2 mt-2 w-full">
              <button type="submit" disabled={editLoading} className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium">{editLoading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}</button>
              <button type="button" onClick={() => setEditInvoice(null)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">{language === 'ar' ? 'إلغاء' : 'Cancel'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 