import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const translations = {
  // Common
  dashboard: { en: "Dashboard" },
  save: { en: "Save" },
  cancel: { en: "Cancel" },
  edit: { en: "Edit" },
  delete: { en: "Delete" },
  add: { en: "Add" },
  search: { en: "Search" },
  filter: { en: "Filter" },
  export: { en: "Export" },
  import: { en: "Import" },
  upload: { en: "Upload" },
  download: { en: "Download" },
  view: { en: "View" },
  confirm: { en: "Confirm" },
  loading: { en: "Loading..." },
  date: { en: "Date" },
  time: { en: "Time" },
  status: { en: "Status" },
  amount: { en: "Amount" },
  total: { en: "Total" },
  price: { en: "Price" },
  quantity: { en: "Quantity" },
  description: { en: "Description" },
  name: { en: "Name" },
  email: { en: "Email" },
  phone: { en: "Phone" },
  address: { en: "Address" },
  notes: { en: "Notes" },
  actions: { en: "Actions" },

  // Company & System
  bursaHilal: { en: "Bursa Hilal" },
  factoryManagement: {
    en: "Factory Management System",
    ar: "نظام إدارة المصنع",
  },
  welcomeBack: { en: "Welcome Back", ar: "مرحباً بعودتك" },
  signIn: { en: "Sign In", ar: "تسجيل الدخول" },
  emailAddress: { en: "Email Address", ar: "البريد الإلكتروني" },
  password: { en: "Password", ar: "كلمة المرور" },
  enterEmail: { en: "Enter your email", ar: "أدخل بريدك الإلكتروني" },
  enterPassword: { en: "Enter your password", ar: "أدخل كلمة المرور" },
  demoAccounts: { en: "Demo Accounts:", ar: "حسابات تجريبية:" },

  // Page Headers
  inventoryManagement: { en: "Inventory Management" },
  manageFabricStock: {
    en: "Manage fabric stock by type and color with automated alerts",
    ar: "إدارة مخزون الأقمشة حسب النوع واللون مع التنبيهات التلقائية",
  },

  // Breadcrumbs and Navigation
  home: { en: "Home", ar: "الرئيسية" },

  // Navigation
  ordersManagement: { en: "Orders Management", ar: "إدارة الطلبات" },
  trackOrder: { en: "Track Order", ar: "تتبع الطلب" },
  customers: { en: "Customers", ar: "العملاء" },
  invoices: { en: "Invoices", ar: "الفواتير" },
  inventory: { en: "Inventory", ar: "المخزون" },
  employees: { en: "Employees & Tasks", ar: "الموظفين والمهام" },
  notifications: { en: "Smart Notifications", ar: "الإشعارات الذكية" },
  financial: { en: "Financial Dashboard", ar: "لوحة المالية" },
  suppliers: { en: "Supplier Management", ar: "إدارة الموردين" },

  // Page headers and descriptions
  ordersManagementDesc: {
    en: "View, add, track, and manage customer orders",
    ar: "عرض وإضافة وتتبع وإدارة طلبات العملاء",
  },
  trackOrderDesc: {
    en: "Monitor all active orders and their progress at a glance",
    ar: "مراقبة جميع الطلبات النشطة وتقدمها لمحة سريعة",
  },
  customersDesc: {
    en: "Manage customer profiles, order history, and contact information",
    ar: "إدارة ملفات العملاء وتاريخ الطلبات ومعلومات الاتصال",
  },
  financialDesc: {
    en: "Track earnings, expenses, and profit/loss with detailed analytics",
    ar: "تتبع الأرباح والمصروفات والربح/الخسارة مع التحليلات التفصيلية",
  },
  suppliersDesc: {
    en: "Manage external factories with files and ratings",
    ar: "إدارة المصانع الخارجية مع الملفات والتقييمات",
  },
  addSupplier: { en: "Add Supplier", ar: "إضافة مورد" },

  // Track Order specific
  trackOrders: { en: "Track Orders", ar: "تتبع الطلبات" },
  monitorActiveOrders: {
    en: "Monitor all active orders and their progress at a glance",
    ar: "مراقبة جميع الطلبات النشطة وتقدمها لمحة سريعة",
  },
  showingOrders: { en: "Showing", ar: "عرض" },
  of: { en: "of", ar: "من" },
  orders: { en: "orders", ar: "طلبات" },
  allStatus: { en: "All Status", ar: "جميع الحالات" },

  // Orders
  newOrder: { en: "New Order", ar: "طلب جديد" },
  orderID: { en: "Order ID", ar: "رقم الطلب" },
  customer: { en: "Customer", ar: "العميل" },
  deadline: { en: "Deadline", ar: "الموعد النهائي" },
  totalOrders: { en: "Total Orders", ar: "إجمالي الطلبات" },
  processing: { en: "Processing", ar: "قيد التنفيذ" },
  completed: { en: "Completed", ar: "مكتمل" },
  cancelled: { en: "Cancelled", ar: "ملغي" },
  pending: { en: "Pending", ar: "مع��ق" },
  orderDetails: { en: "Order Details", ar: "تفاصيل الطلب" },
  items: { en: "Items", ar: "العناصر" },

  // Customers
  addCustomer: { en: "Add Customer", ar: "إضافة عميل" },
  customerName: { en: "Customer Name", ar: "اسم العميل" },
  company: { en: "Company", ar: "الشركة" },
  totalRevenue: { en: "Total Revenue", ar: "إجمالي الإيرادات" },

  // Invoices
  createInvoice: { en: "Create Invoice", ar: "إنشاء فاتورة" },
  uploadInvoice: { en: "Upload Invoice", ar: "رفع فاتورة" },
  invoiceNumber: { en: "Invoice Number", ar: "رقم الفاتورة" },
  invoiceDate: { en: "Invoice Date", ar: "تاريخ الفاتورة" },
  invoiceType: { en: "Invoice Type", ar: "نوع الفاتورة" },
  salesInvoice: { en: "Sales Invoice", ar: "فاتورة بيع" },
  purchaseInvoice: { en: "Purchase Invoice", ar: "فاتورة شراء" },
  paid: { en: "Paid", ar: "مدفوع" },
  unpaid: { en: "Unpaid", ar: "غير مدفوع" },
  partiallyPaid: { en: "Partially Paid", ar: "مدفوع جزئياً" },
  paymentStatus: { en: "Payment Status", ar: "حالة الدفع" },
  paymentMethod: { en: "Payment Method", ar: "طريقة الدفع" },
  cash: { en: "Cash", ar: "نقداً" },
  bankTransfer: { en: "Bank Transfer", ar: "حوالة بنكية" },
  wireTransfer: { en: "Wire Transfer", ar: "حوالة مصرفية" },
  amountReceived: { en: "Amount Received", ar: "المبلغ المستلم" },
  amountRemaining: { en: "Amount Remaining", ar: "المبلغ المتبقي" },
  dueDate: { en: "Due Date", ar: "تاريخ الاستحقاق" },
  overdue: { en: "Overdue", ar: "متأخر" },

  // Inventory
  addStock: { en: "Add Stock", ar: "إضافة مخزون" },
  lowStock: { en: "Low Stock", ar: "مخزون منخفض" },
  stockValue: { en: "Stock Value", ar: "قيمة المخزون" },
  fabricType: { en: "Fabric Type", ar: "نوع القماش" },
  color: { en: "Color", ar: "اللون" },
  meters: { en: "meters", ar: "متر" },
  jacquard: { en: "Jacquard", ar: "جاكار" },
  velvet: { en: "Velvet", ar: "مخمل" },
  nubuk: { en: "Nubuk", ar: "نوبوك" },
  babyface: { en: "Babyface", ar: "بيبي فيس" },
  boucle: { en: "Bouclé", ar: "بوكليه" },
  reorder: { en: "Reorder", ar: "إعادة طلب" },
  update: { en: "Update", ar: "تحديث" },
  lowStockAlert: { en: "Low Stock Alert", ar: "تنبيه المخزون المنخفض" },
  totalItems: { en: "Total Items", ar: "إجمالي العناصر" },
  fabricTypesInStock: {
    en: "Fabric types in stock",
    ar: "أنواع الأقمشة في المخزون",
  },
  totalInventoryValue: {
    en: "Total inventory value",
    ar: "إجمالي قيمة المخزون",
  },
  avgUnitPrice: { en: "Avg Unit Price", ar: "متوسط سعر الوحدة" },
  perMeterAverage: { en: "Per meter average", ar: "متوسط لكل متر" },
  searchFabrics: { en: "Search fabrics...", ar: "بحث عن الأقمشة..." },
  allTypes: { en: "All Types", ar: "جميع الأنواع" },
  moreFilters: { en: "More Filters", ar: "مزيد من التصفية" },
  unitPrice: { en: "Unit Price", ar: "سعر الوحدة" },
  totalValue: { en: "Total Value", ar: "القيمة الإجمالية" },
  good: { en: "Good", ar: "جيد" },
  medium: { en: "Medium", ar: "متوسط" },
  low: { en: "Low", ar: "منخفض" },
  belowMinimumThreshold: {
    en: "Below minimum threshold",
    ar: "أقل من الحد الأدنى",
  },
  lowStockAlerts: { en: "Low Stock Alerts", ar: "تنبيهات المخزون المنخفض" },
  onlyRemaining: { en: "Only", ar: "فقط" },
  remaining: { en: "remaining", ar: "متبقي" },
  itemsBelow: { en: "Items below", ar: "عناصر أقل من" },

  // Employees
  addEmployee: { en: "Add Employee", ar: "إضافة موظف" },
  employeeName: { en: "Employee Name", ar: "اسم الموظف" },
  position: { en: "Position", ar: "المنصب" },
  salary: { en: "Salary", ar: "الراتب" },
  paidAmount: { en: "Paid Amount", ar: "المبلغ المدفوع" },
  remainingAmount: { en: "Remaining Amount", ar: "المبلغ المتبقي" },
  hoursWorked: { en: "Hours Worked", ar: "ساعات العمل" },
  shift: { en: "Shift", ar: "الوردية" },
  morningShift: { en: "Morning Shift", ar: "الوردية الصباحية" },
  eveningShift: { en: "Evening Shift", ar: "الوردية المسائية" },
  nightShift: { en: "Night Shift", ar: "الوردية الليلية" },
  absences: { en: "Absences", ar: "الغيابات" },
  overtime: { en: "Overtime", ar: "ساعات إضافية" },
  active: { en: "Active", ar: "نشط" },
  onLeave: { en: "On Leave", ar: "في إجازة" },
  absent: { en: "Absent", ar: "غائب" },
  performance: { en: "Performance", ar: "الأداء" },
  attendance: { en: "Attendance", ar: "الحضور" },
  present: { en: "Present", ar: "حاضر" },
  late: { en: "Late", ar: "متأخر" },
  leave: { en: "Leave", ar: "إجازة" },
  lastWorkDate: { en: "Last Work Date", ar: "آخر يوم عمل" },

  // Employee Modal specific
  overview: { en: "Overview", ar: "نظرة عامة" },
  shiftInformation: { en: "Shift Information", ar: "معلومات الوردية" },
  paidSalary: { en: "Paid Salary", ar: "الراتب المدفوع" },
  salaryDetails: { en: "Salary Details", ar: "تفاصيل الراتب" },
  baseSalary: { en: "Base Salary", ar: "الراتب الأساسي" },
  paymentPercentage: { en: "Payment Percentage", ar: "نسبة الدفع" },
  salaryAdjustment: { en: "Salary Adjustment", ar: "تعديل الراتب" },
  adjustmentAmount: { en: "Adjustment Amount", ar: "مبلغ التعديل" },
  adjustmentReason: { en: "Adjustment Reason", ar: "سبب التعديل" },
  selectReason: { en: "Select Reason", ar: "اختر السبب" },
  bonus: { en: "Bonus", ar: "مكافأة" },
  deduction: { en: "Deduction", ar: "خصم" },
  saveAdjustment: { en: "Save Adjustment", ar: "حفظ التعديل" },
  attendanceRecord: { en: "Attendance Record", ar: "تسجيل الحضور" },
  registerAttendance: { en: "Register Attendance", ar: "تسجيل الحضور" },
  attendanceHistory: {
    en: "Attendance History (Last 7 Days)",
    ar: "سجل الحضور (آخر 7 أيام)",
  },
  privateNotes: { en: "Private Notes", ar: "ملاحظات خاصة" },
  writeNotesAboutEmployee: {
    en: "Write notes about the employee...",
    ar: "اكتب ملاحظات خاصة عن الموظف...",
  },
  saveNotes: { en: "Save Notes", ar: "حفظ الملاحظات" },
  violationsAndRewards: {
    en: "Violations and Rewards Log",
    ar: "سجل المخالفات والمكافآت",
  },
  performanceIndicator: { en: "Performance Indicator", ar: "مؤشر الأداء" },
  overall: { en: "Overall", ar: "الأداء العام" },
  excellent: { en: "Excellent", ar: "ممتاز" },
  good: { en: "Good", ar: "جيد" },
  average: { en: "Average", ar: "متوسط" },
  workingDays: { en: "Working Days", ar: "أيام الحضور" },
  updateData: { en: "Update Data", ar: "تحديث البيانات" },
  close: { en: "Close" },

  // Notifications
  smartNotifications: { en: "Smart Notifications", ar: "الإشعارات الذكية" },
  markAsRead: { en: "Mark as Read", ar: "تمت القراءة" },
  markAllAsRead: { en: "Mark All as Read", ar: "تمت قراءة الكل" },
  newNotification: { en: "New Notification", ar: "إشعار جديد" },
  highPriority: { en: "High Priority", ar: "أولوية عالية" },
  mediumPriority: { en: "Medium Priority", ar: "أولوية متوسطة" },
  lowPriority: { en: "Low Priority", ar: "أولوية منخفضة" },
  productionDelay: { en: "Production Delay", ar: "تأخير الإنتاج" },
  orderUpdate: { en: "Order Update", ar: "تحديث الطلب" },
  taskCompleted: { en: "Task Completed", ar: "مهمة مكتملة" },
  invoiceDue: { en: "Invoice Due", ar: "فاتورة مستحقة" },
  systemAlert: { en: "System Alert", ar: "تنبيه النظام" },

  // Financial
  financialDashboard: { en: "Financial Dashboard", ar: "لوحة المالية" },
  totalExpenses: { en: "Total Expenses", ar: "إجمالي المصروفات" },
  netProfit: { en: "Net Profit", ar: "صافي الربح" },
  profitMargin: { en: "Profit Margin", ar: "هامش الربح" },
  monthlyRevenue: { en: "Monthly Revenue", ar: "الإيرادات الشهرية" },
  expenseBreakdown: { en: "Expense Breakdown", ar: "تفصيل المصروفات" },
  labor: { en: "Labor", ar: "العمالة" },
  rawMaterials: { en: "Raw Materials", ar: "المواد الخام" },
  utilities: { en: "Utilities", ar: "المرافق" },
  equipment: { en: "Equipment", ar: "المعدات" },
  maintenance: { en: "Maintenance", ar: "الصيانة" },
  miscellaneous: { en: "Miscellaneous", ar: "متنوعة" },
  exportReport: { en: "Export Report", ar: "تصدير التقرير" },

  // General Messages
  welcome: { en: "Welcome", ar: "مرحباً" },
  todaysOverview: { en: "Today's Overview", ar: "نظرة عامة على اليوم" },
  newOrders: { en: "New Orders", ar: "طلبات جديدة" },
  tasksCompleted: { en: "Tasks Completed", ar: "مهام مكتملة" },
  activeAlerts: { en: "Active Alerts", ar: "تنبيهات نشطة" },
  quickActions: { en: "Quick Actions", ar: "إجراءات سريعة" },
  overdueOrders: { en: "Overdue Orders", ar: "طلبات متأخرة" },
  pendingPayments: { en: "Pending Payments", ar: "مدفوعات معلقة" },
  productionRate: { en: "Production Rate", ar: "معدل الإنتاج" },

  // Error Messages
  errorOccurred: { en: "An error occurred", ar: "حدث خطأ" },
  tryAgain: { en: "Please try again", ar: "يرجى المحاولة مرة أخرى" },
  invalidInput: { en: "Invalid input", ar: "إدخال غير صحيح" },
  requiredField: { en: "This field is required", ar: "هذا الحقل مطلوب" },

  // Success Messages
  saveSuccess: { en: "Saved successfully", ar: "تم الحفظ بنجاح" },
  updateSuccess: { en: "Updated successfully", ar: "تم التحديث بنجاح" },
  deleteSuccess: { en: "Deleted successfully", ar: "تم الحذف بنجاح" },
  addSuccess: { en: "Added successfully", ar: "تم الإضافة بنجاح" },

  // Fabric Colors
  white: { en: "White", ar: "أبيض" },
  black: { en: "Black", ar: "أسود" },
  red: { en: "Red", ar: "أحمر" },
  blue: { en: "Blue", ar: "أزرق" },
  green: { en: "Green", ar: "أخضر" },
  yellow: { en: "Yellow", ar: "أصفر" },
  orange: { en: "Orange", ar: "برتقالي" },
  purple: { en: "Purple", ar: "بنفسجي" },
  pink: { en: "Pink", ar: "وردي" },
  brown: { en: "Brown", ar: "بني" },
  gray: { en: "Gray", ar: "رمادي" },
  beige: { en: "Beige", ar: "بيج" },
  cream: { en: "Cream", ar: "كريمي" },
  gold: { en: "Gold", ar: "ذهبي" },
  silver: { en: "Silver", ar: "فضي" },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    const translation = translations[key as keyof typeof translations];
    if (!translation) {
      console.warn(`Translation key "${key}" not found`);
      return key;
    }
    return translation[language];
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
