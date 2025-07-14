import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { showSuccessToast, showErrorToast } from "../utils/toast";
import apiService from "../services/api";
import {
  X,
  DollarSign,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  Plus,
  Minus,
  Save,
  Edit,
  CheckCircle,
  FileText,
  TrendingUp,
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  position: string;
  salary: number;
  paid: number;
  remaining: number;
  hoursWorked: number;
  shift: string;
  absences: number;
  overtime: number;
  status: "active" | "on_leave" | "absent";
  lastWorkDate: string;
  notes?: string;
  attendance?: Array<{
    date: string;
    status: "present" | "absent";
    timestamp: string;
  }>;
  salaryTransactions?: Array<{
    date: string;
    type: string;
    amount: number;
    timestamp: string;
    description: string;
  }>;
}

interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onEmployeeUpdate?: () => void;
}

export default function EmployeeDetailModal({
  isOpen,
  onClose,
  employee,
  onEmployeeUpdate,
}: EmployeeDetailModalProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [salaryAdjustment, setSalaryAdjustment] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [employeeNotes, setEmployeeNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceStatus, setAttendanceStatus] = useState("present");

  // Calculate real performance score based on attendance data
  const calculatePerformanceScore = (emp: Employee) => {
    if (!emp) return 0;
    
    // Get attendance records for the last 30 days
    const currentDate = new Date();
    const thirtyDaysAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    let recentAttendance = 0;
    let totalDays = 0;
    
    if (emp.attendance && emp.attendance.length > 0) {
      // Count actual attendance records from the last 30 days
      const recentRecords = emp.attendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= thirtyDaysAgo && recordDate <= currentDate;
      });
      
      totalDays = recentRecords.length;
      recentAttendance = recentRecords.filter(record => record.status === 'present').length;
    } else {
      // Fallback to basic calculation if no attendance records
      totalDays = 30;
      recentAttendance = Math.max(0, totalDays - (emp.absences || 0));
    }
    
    // Calculate attendance rate (70% of total score)
    const attendanceRate = totalDays > 0 ? (recentAttendance / totalDays) * 100 : 0;
    let score = attendanceRate * 0.7;
    
    // Overtime bonus (15% of total score)
    const overtimeScore = Math.min((emp.overtime || 0) * 2, 15); // Max 15 points
    score += overtimeScore;
    
    // Hours worked factor (15% of total score)
    const expectedHours = 160; // Expected hours per month
    const actualHours = emp.hoursWorked || 0;
    const hoursEfficiency = Math.min((actualHours / expectedHours) * 100, 100);
    score += (hoursEfficiency * 0.15);
    
    // Salary payment discipline (bonus points)
    if (emp.salary && emp.paid) {
      const paymentRate = (emp.paid / emp.salary) * 100;
      if (paymentRate >= 80) {
        score += 5; // Bonus for good payment discipline
      }
    }
    
    return Math.min(Math.max(score, 0), 100); // Keep between 0-100
  };

  const performanceScore = employee ? calculatePerformanceScore(employee) : 0;

  const tabs = [
    {
      id: "overview",
      label: language === "ar" ? "نظرة عامة" : "Overview",
      icon: User,
    },
    {
      id: "salary",
      label: language === "ar" ? "الراتب" : "Salary",
      icon: DollarSign,
    },
    {
      id: "attendance",
      label: language === "ar" ? "الحضور" : "Attendance",
      icon: Clock,
    },
    {
      id: "notes",
      label: language === "ar" ? "الملاحظات" : "Notes",
      icon: FileText,
    },
    {
      id: "performance",
      label: language === "ar" ? "الأداء" : "Performance",
      icon: TrendingUp,
    },
  ];

  // Update notes when employee changes
  useEffect(() => {
    if (employee) {
      setEmployeeNotes(employee.notes || "");
    }
  }, [employee]);

  // Save salary adjustment function
  const handleSalaryAdjustment = async () => {
    if (!employee || salaryAdjustment === 0 || !adjustmentReason) return;

    try {
      setSaving(true);

      let updatedEmployee = { ...employee };
      
      // Initialize salary transactions array if it doesn't exist
      if (!updatedEmployee.salaryTransactions) {
        updatedEmployee.salaryTransactions = [];
      }

      // Create transaction record
      const transaction = {
        date: new Date().toISOString().split("T")[0],
        type: adjustmentReason,
        amount: salaryAdjustment,
        timestamp: new Date().toISOString(),
        description: `${adjustmentReason}: ${salaryAdjustment >= 0 ? "+" : ""}${salaryAdjustment} ₺`
      };

      updatedEmployee.salaryTransactions.push(transaction);

      // Calculate new salary values based on transaction type
      let newPaid = employee.paid;
      let newRemaining = employee.remaining;

      switch (adjustmentReason) {
        case "استلام راتب":
          newPaid = Math.min(employee.paid + Math.abs(salaryAdjustment), employee.salary);
          break;
        case "مكافأة":
          // Bonus adds to both paid and total salary
          updatedEmployee.salary = employee.salary + Math.abs(salaryAdjustment);
          newPaid = employee.paid + Math.abs(salaryAdjustment);
          break;
        case "خصم":
          newPaid = Math.max(employee.paid - Math.abs(salaryAdjustment), 0);
          break;
        case "ساعات إضافية":
          // Overtime adds to total salary and paid
          const overtimeAmount = Math.abs(salaryAdjustment);
          updatedEmployee.salary = employee.salary + overtimeAmount;
          newPaid = employee.paid + overtimeAmount;
          updatedEmployee.overtime = (employee.overtime || 0) + Math.floor(overtimeAmount / 50); // Assume 50₺ per hour
          break;
        case "غياب":
          // Absence deducts from paid amount
          newPaid = Math.max(employee.paid - Math.abs(salaryAdjustment), 0);
          updatedEmployee.absences = (employee.absences || 0) + 1;
          break;
        default:
          break;
      }

      newRemaining = updatedEmployee.salary - newPaid;

      updatedEmployee = {
        ...updatedEmployee,
        paid: newPaid,
        remaining: newRemaining,
      };

      await apiService.updateEmployee(employee.id, updatedEmployee);

      showSuccessToast(
        language === "ar"
          ? `تم تسجيل ${adjustmentReason} بمبلغ ${salaryAdjustment >= 0 ? "+" : ""}${salaryAdjustment} ₺ بنجاح`
          : `${adjustmentReason} of ${salaryAdjustment >= 0 ? "+" : ""}${salaryAdjustment} ₺ recorded successfully`
      );

      setSalaryAdjustment(0);
      setAdjustmentReason("");

      if (onEmployeeUpdate) {
        onEmployeeUpdate();
      }
    } catch (error) {
      console.error("Error updating employee salary:", error);
      showErrorToast(
        language === "ar" ? "خطأ في تسجيل المعاملة" : "Error recording transaction"
      );
    } finally {
      setSaving(false);
    }
  };

  // Mark attendance function
  const markAttendance = async (type: "present" | "absent") => {
    if (!employee) return;

    try {
      setAttendanceLoading(true);

      let updatedEmployee = { ...employee };
      
      // Initialize attendance array if it doesn't exist
      if (!updatedEmployee.attendance) {
        updatedEmployee.attendance = [];
      }

      // Add new attendance record
      const attendanceRecord = {
        date: attendanceDate,
        status: type,
        timestamp: new Date().toISOString()
      };

      updatedEmployee.attendance.push(attendanceRecord);

      if (type === "present") {
        // Mark as present - update last work date and hours
        updatedEmployee = {
          ...updatedEmployee,
          lastWorkDate: attendanceDate,
          hoursWorked: employee.hoursWorked + 8, // Add 8 hours for a full day
          status: "active" as const,
        };
      } else {
        // Mark as absent - increment absences
        updatedEmployee = {
          ...updatedEmployee,
          absences: employee.absences + 1,
          status: "absent" as const,
        };
      }

      await apiService.updateEmployee(employee.id, updatedEmployee);

      showSuccessToast(
        language === "ar"
          ? `تم تسجيل ${type === "present" ? "الحضور" : "الغياب"} بنجاح للتاريخ ${attendanceDate}`
          : `${type === "present" ? "Attendance" : "Absence"} marked successfully for ${attendanceDate}`
      );

      if (onEmployeeUpdate) {
        onEmployeeUpdate();
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      showErrorToast(
        language === "ar"
          ? "خطأ في تسجيل الحضور"
          : "Error marking attendance"
      );
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Save notes function
  const saveNotes = async () => {
    if (!employee) return;

    try {
      setNotesLoading(true);

      const updatedEmployee = {
        ...employee,
        notes: employeeNotes,
      };

      await apiService.updateEmployee(employee.id, updatedEmployee);

      showSuccessToast(
        language === "ar"
          ? "تم حفظ الملاحظات بنجاح"
          : "Notes saved successfully"
      );

      if (onEmployeeUpdate) {
        onEmployeeUpdate();
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      showErrorToast(
        language === "ar"
          ? "خطأ في حفظ الملاحظات"
          : "Error saving notes"
      );
    } finally {
      setNotesLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  if (!employee) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">
            {language === "ar" ? "لا توجد بيانات موظف" : "No employee data"}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            {language === "ar" ? "إغلاق" : "Close"}
          </button>
        </div>
      </div>
    );
  }

  try {
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
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">{employee?.name || 'Unknown Employee'}</h2>
                <p className="text-green-100">{employee?.position || 'No Position'}</p>
                <div className="flex items-center mt-2 space-x-4 text-green-100">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {language === "ar" ? "آخر عمل" : "Last work"}:{" "}
                    {employee?.lastWorkDate || 'N/A'}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      employee?.status === "active"
                        ? "bg-green-500"
                        : employee?.status === "on_leave"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  >
                    {employee?.status === "active"
                      ? language === "ar"
                        ? "نشط"
                        : "Active"
                      : employee?.status === "on_leave"
                      ? language === "ar"
                        ? "إجازة"
                        : "On Leave"
                      : language === "ar"
                      ? "غائب"
                      : "Absent"}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-sm">
                          {language === "ar" ? "ساعات العمل" : "Hours Worked"}
                        </p>
                        <p className="text-2xl font-bold text-blue-800">
                          {employee?.hoursWorked || 0}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm">
                          {language === "ar" ? "الراتب المدفوع" : "Paid Salary"}
                        </p>
                        <p className="text-2xl font-bold text-green-800">
                          {employee?.paid?.toLocaleString() || 0}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-600 text-sm">
                          {language === "ar" ? "الغيابات" : "Absences"}
                        </p>
                        <p className="text-2xl font-bold text-orange-800">
                          {employee?.absences || 0}
                        </p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-orange-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {language === "ar" ? "معلومات الوردية" : "Shift Information"}
                  </h4>
                  <p className="text-gray-600">
                    {language === "ar" ? "الوردية" : "Shift"}:{" "}
                    {language === "ar"
                      ? employee?.shift || "غير محدد"
                      : employee?.shift === "الصباحية"
                      ? "Morning"
                      : employee?.shift === "المسائية"
                      ? "Evening"
                      : "Night"}
                  </p>
                  <p className="text-gray-600">
                    {language === "ar" ? "ساعات إضافية" : "Overtime"}:{" "}
                    {employee?.overtime || 0} {language === "ar" ? "ساعة" : "hours"}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "salary" && (
              <div className="space-y-6">
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="font-semibold text-green-800 mb-4">
                    تفاصيل الراتب
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">الراتب الأساسي</p>
                      <p className="text-xl font-bold text-gray-900">
                        {employee?.salary?.toLocaleString() || 0} ₺
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">المدفوع</p>
                      <p className="text-xl font-bold text-green-600">
                        {employee?.paid?.toLocaleString() || 0} ₺
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {language === "ar" ? "المتبقي" : "Remaining"}
                      </p>
                      <p className="text-xl font-bold text-orange-600">
                        {employee?.remaining?.toLocaleString() || 0} ₺
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {language === "ar" ? "نسبة الدفع" : "Payment Rate"}
                      </p>
                      <p className="text-xl font-bold text-blue-600">
                        {employee?.salary ? ((employee.paid / employee.salary) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Salary Adjustment Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    {language === "ar" ? "تعديل الراتب" : "Salary Adjustment"}
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "ar" ? "نوع المعاملة" : "Transaction Type"}
                      </label>
                      <select
                        value={adjustmentReason}
                        onChange={(e) => setAdjustmentReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">
                          {language === "ar" ? "اختر نوع المعاملة" : "Select Transaction Type"}
                        </option>
                        <option value="استلام راتب">
                          {language === "ar" ? "استلام راتب" : "Salary Payment"}
                        </option>
                        <option value="مكافأة">
                          {language === "ar" ? "مكافأة" : "Bonus"}
                        </option>
                        <option value="خصم">
                          {language === "ar" ? "خصم" : "Deduction"}
                        </option>
                        <option value="ساعات إضافية">
                          {language === "ar" ? "ساعات إضافية" : "Overtime"}
                        </option>
                        <option value="غياب">
                          {language === "ar" ? "غياب" : "Absence"}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "ar" ? "المبلغ" : "Amount"}
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSalaryAdjustment(
                              Math.max(salaryAdjustment - 100, -5000)
                            )
                          }
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={salaryAdjustment}
                          onChange={(e) =>
                            setSalaryAdjustment(Number(e.target.value))
                          }
                          placeholder="0"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setSalaryAdjustment(
                              Math.min(salaryAdjustment + 100, 5000)
                            )
                          }
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {language === "ar" ? "المبلغ:" : "Amount:"} {salaryAdjustment >= 0 ? "+" : ""}{salaryAdjustment} ₺
                      </p>
                    </div>
                    <button
                      onClick={handleSalaryAdjustment}
                      disabled={
                        saving || !adjustmentReason || salaryAdjustment === 0
                      }
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>
                        {language === "ar" ? "تطبيق المعاملة" : "Apply Transaction"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Salary Transactions History */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    {language === "ar" ? "سجل معاملات الراتب" : "Salary Transaction History"}
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {employee?.salaryTransactions?.slice(-10).reverse().map((transaction, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            transaction.amount >= 0 ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <span className="text-sm font-medium block">
                              {transaction.type}
                            </span>
                            <span className="text-xs text-gray-500">
                              {transaction.description}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-bold ${
                            transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount >= 0 ? "+" : ""}{transaction.amount} ₺
                          </span>
                          <div className="text-xs text-gray-500">
                            {new Date(transaction.date).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!employee?.salaryTransactions || employee.salaryTransactions.length === 0) && (
                      <p className="text-center text-gray-500 py-4">
                        {language === "ar" ? "لا توجد معاملات راتب" : "No salary transactions"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "attendance" && (
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-800 mb-4">
                    {language === "ar" ? "تسجيل الحضور" : "Mark Attendance"}
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "ar" ? "تاريخ الحضور" : "Attendance Date"}
                      </label>
                      <input
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => markAttendance('present')}
                        disabled={attendanceLoading}
                        className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                      >
                        {attendanceLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        <span>{language === "ar" ? "تسجيل حضور" : "Mark Present"}</span>
                      </button>
                      <button
                        onClick={() => markAttendance('absent')}
                        disabled={attendanceLoading}
                        className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                      >
                        {attendanceLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                        <span>{language === "ar" ? "تسجيل غياب" : "Mark Absent"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Attendance History */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    {language === "ar" ? "سجل الحضور" : "Attendance History"}
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {employee?.attendance?.slice(-10).reverse().map((record, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {record.status === 'present' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          )}
                          <span className="text-sm font-medium">
                            {language === "ar" 
                              ? (record.status === 'present' ? "حضر" : "غائب")
                              : (record.status === 'present' ? "Present" : "Absent")
                            }
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {new Date(record.date).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}
                        </span>
                      </div>
                    ))}
                    {(!employee?.attendance || employee.attendance.length === 0) && (
                      <p className="text-center text-gray-500 py-4">
                        {language === "ar" ? "لا توجد سجلات حضور" : "No attendance records"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-6">
                <div className="bg-yellow-50 rounded-lg p-6">
                  <h4 className="font-semibold text-yellow-800 mb-4">
                    {language === "ar" ? "ملاحظات خاصة" : "Private Notes"}
                  </h4>
                  <textarea
                    value={employeeNotes}
                    onChange={(e) => setEmployeeNotes(e.target.value)}
                    placeholder={language === "ar" ? "اكتب ملاحظات خاصة عن الموظف..." : "Write private notes about the employee..."}
                    className="w-full h-32 p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  />
                  <button 
                    onClick={saveNotes}
                    disabled={notesLoading}
                    className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {notesLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{language === "ar" ? "حفظ الملاحظات" : "Save Notes"}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === "performance" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold text-purple-800 mb-4">
                    {language === "ar" ? "مؤشر الأداء" : "Performance Indicator"}
                  </h4>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">
                          {language === "ar" ? "الأداء العام" : "Overall Performance"}
                        </span>
                        <span className="font-medium">{performanceScore.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${performanceScore}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-3xl font-bold ${
                          performanceScore >= 90
                            ? "text-green-600"
                            : performanceScore >= 70
                            ? "text-blue-600"
                            : "text-orange-600"
                        }`}
                      >
                        {performanceScore >= 90
                          ? (language === "ar" ? "ممتاز" : "Excellent")
                          : performanceScore >= 70
                          ? (language === "ar" ? "جيد" : "Good")
                          : (language === "ar" ? "متوسط" : "Average")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {employee?.hoursWorked || 0}
                      </div>
                      <p className="text-sm text-gray-600">
                        {language === "ar" ? "ساعات العمل" : "Work Hours"}
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        {language === "ar" 
                          ? `من ${160} ساعة متوقعة`
                          : `of ${160} expected hours`
                        }
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {employee ? Math.max(0, 30 - (employee.absences || 0)) : 0}
                      </div>
                      <p className="text-sm text-gray-600">
                        {language === "ar" ? "أيام الحضور" : "Attendance Days"}
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        {language === "ar" 
                          ? `${employee?.absences || 0} أيام غياب`
                          : `${employee?.absences || 0} absent days`
                        }
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {employee?.overtime || 0}
                      </div>
                      <p className="text-sm text-gray-600">
                        {language === "ar" ? "ساعات إضافية" : "Overtime Hours"}
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        {language === "ar" 
                          ? "مكافآت إضافية"
                          : "Bonus eligible"
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Breakdown */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    {language === "ar" ? "تفصيل تقييم الأداء" : "Performance Breakdown"}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {language === "ar" ? "معدل الحضور (70%)" : "Attendance Rate (70%)"}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${employee ? Math.max(0, ((30 - (employee.absences || 0)) / 30) * 100) : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {employee ? Math.round(((30 - (employee.absences || 0)) / 30) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {language === "ar" ? "ساعات العمل (15%)" : "Work Hours (15%)"}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${employee ? Math.min(((employee.hoursWorked || 0) / 160) * 100, 100) : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {employee ? Math.min(Math.round(((employee.hoursWorked || 0) / 160) * 100), 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {language === "ar" ? "ساعات إضافية (15%)" : "Overtime (15%)"}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${employee ? Math.min(((employee.overtime || 0) / 10) * 100, 100) : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {employee ? Math.min(Math.round(((employee.overtime || 0) / 10) * 100), 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {language === "ar" ? "إغلاق" : "Close"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  } catch (error) {
    console.error("Error rendering EmployeeDetailModal:", error);
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="bg-white rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">
            {language === "ar" ? "حدث خطأ في تحميل بيانات الموظف" : "Error loading employee data"}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {language === "ar" ? "إغلاق" : "Close"}
          </button>
        </div>
      </motion.div>
    );
  }
}
