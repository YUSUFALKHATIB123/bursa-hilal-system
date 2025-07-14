import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage, Language } from "../contexts/LanguageContext";
import systemData from "../data/systemData";
import { realFinancialData } from "../utils/financialCalculations";
import apiService from "../services/api";
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  cardHover,
  buttonPress,
} from "../utils/animations";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Time filter options
const timeFilters = [
  { id: "week", label: { ar: "هذا الأسبوع", en: "This Week" } },
  { id: "month", label: { ar: "هذا الشهر", en: "This Month" } },
  { id: "quarter", label: { ar: "هذا الربع", en: "This Quarter" } },
  { id: "year", label: { ar: "هذا العام", en: "This Year" } },
];

// Real financial data hook
const useFinancialData = (timeFilter: string) => {
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        // Fetch real data from API
        const [invoices, employees] = await Promise.all([
          apiService.getInvoices(),
          apiService.getEmployees(),
        ]);

        // Calculate real financial metrics
        const currentDate = new Date();
        let startDate = new Date();

        switch (timeFilter) {
          case "week":
            startDate.setDate(currentDate.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(currentDate.getMonth() - 1);
            break;
          case "quarter":
            startDate.setMonth(currentDate.getMonth() - 3);
            break;
          case "year":
            startDate.setFullYear(currentDate.getFullYear() - 1);
            break;
        }

        // Calculate revenue from invoices with proper null checking
        const currentRevenue = invoices
          .filter(inv => new Date(inv.date) >= startDate)
          .reduce((sum, inv) => {
            const amount = inv.amountReceived || inv.amount || inv.total || 0;
            return sum + (typeof amount === 'number' ? amount : 0);
          }, 0);

        // Calculate previous period for comparison
        const previousStartDate = new Date(startDate);
        const periodDiff = currentDate.getTime() - startDate.getTime();
        previousStartDate.setTime(startDate.getTime() - periodDiff);

        const previousRevenue = invoices
          .filter(inv => {
            const invDate = new Date(inv.date);
            return invDate >= previousStartDate && invDate < startDate;
          })
          .reduce((sum, inv) => {
            const amount = inv.amountReceived || inv.amount || inv.total || 0;
            return sum + (typeof amount === 'number' ? amount : 0);
          }, 0);

        // Calculate expenses (salaries + other costs) with null checking
        const salaryExpenses = employees
          .reduce((sum, emp) => {
            const salary = emp.paid || emp.salary || 0;
            return sum + (typeof salary === 'number' ? salary : 0);
          }, 0);
        
        // Calculate other real expenses from system data
        const otherExpenses = 15000; // This should be calculated from actual expense records
        const totalExpenses = salaryExpenses + otherExpenses;

        const netProfit = currentRevenue - totalExpenses;
        const profitMargin = currentRevenue > 0 ? (netProfit / currentRevenue) * 100 : 0;

        // Calculate changes with null safety
        const revenueChange = previousRevenue > 0 
          ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
          : (currentRevenue > 0 ? 100 : 0);

        setFinancialData({
          currentRevenue,
          previousRevenue,
          totalExpenses,
          netProfit,
          profitMargin,
          revenueChange,
          invoices: invoices.filter(inv => new Date(inv.date) >= startDate),
          employees,
        });
      } catch (error) {
        console.error("Error fetching financial data:", error);
        // Set default values on error
        setFinancialData({
          currentRevenue: 0,
          previousRevenue: 0,
          totalExpenses: 0,
          netProfit: 0,
          profitMargin: 0,
          revenueChange: 0,
          invoices: [],
          employees: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [timeFilter]);

  return { financialData, loading };
};

// Expense Donut Chart Component
function ExpenseDonutChart({ data }: { data: any[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="flex items-center justify-center h-full">
      <div className="relative w-48 h-48">
        {/* Simple pie chart representation */}
        <div className="w-full h-full rounded-full border-8 border-blue-200 relative overflow-hidden">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            return (
              <div
                key={index}
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(${item.color} 0% ${percentage}%, transparent ${percentage}% 100%)`,
                  transform: `rotate(${data.slice(0, index).reduce((sum, prev) => sum + (prev.value / total) * 360, 0)}deg)`,
                }}
              />
            );
          })}
        </div>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
            <div className="text-center">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-sm font-bold">${total.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="ml-6 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: item.color }}
            />
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-gray-500">${item.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Interactive Donut Chart Component with animations
function InteractiveDonutChart({ data, language }: { data: any[], language: string }) {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: data.map(item => item.color),
        borderColor: data.map(item => item.color),
        borderWidth: 2,
        hoverBorderWidth: 4,
        hoverOffset: 4, // تقليل المسافة عند التمرير لتجنب التقطيع
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // إخفاء الكتابة الجانبية
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 2000,
      easing: 'easeInOutQuart' as const,
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    cutout: '60%',
    layout: {
      padding: 10, // إضافة padding لتجنب التقطيع
    },
  };

  return (
    <div className="relative h-64 flex items-center justify-center">
      <Doughnut data={chartData} options={options} />
      {/* Center text - محسن للتوسيط */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center bg-white rounded-full p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">
            {language === "ar" ? "إجمالي المصروفات" : "Total Expenses"}
          </p>
          <p className="text-lg font-bold text-gray-900">
            ${data.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// Use real monthly data from calculations
const monthlyData = realFinancialData.monthlyData;

// Generate real monthly data from actual invoices and employees
const generateRealMonthlyData = (invoices: any[], employees: any[]) => {
  const monthlyRevenue = {};
  const monthlyExpenses = {};
  
  // Calculate monthly revenue from invoices
  invoices.forEach(invoice => {
    const date = new Date(invoice.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const amount = invoice.amountReceived || invoice.amount || invoice.total || 0;
    monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + amount;
  });
  
  // Calculate monthly expenses (simplified - in reality this would come from expense records)
  const avgMonthlyExpenses = employees.reduce((sum, emp) => {
    const salary = emp.paid || emp.salary || 0;
    return sum + salary;
  }, 0) + 15000; // Base expenses
  
  // Generate last 6 months of data
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en', { month: 'short' });
    
    const revenue = monthlyRevenue[monthKey] || 0;
    const expenses = avgMonthlyExpenses;
    const profit = revenue - expenses;
    
    months.push({
      month: monthName,
      revenue,
      expenses,
      profit
    });
  }
  
  return months;
};

// Use real expense breakdown from calculations
const expenseCategories = realFinancialData.expenseBreakdown;

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  change: string;
  icon: any;
  color: string;
}) {
  const { language } = useLanguage();
  const isPositive = change.startsWith("+");

  return (
    <motion.div
      variants={staggerItem}
      className="mobile-card p-6 will-change-transform"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center mt-2">
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span
              className={`text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}
            >
              {change}
            </span>
            <span className="text-gray-500 text-sm ml-1">
              {language === "ar" ? "مقارنة بالشهر الماضي" : "vs last month"}
            </span>
          </div>
        </div>
        <div className={`p-4 rounded-lg ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

function SimpleBarChart({ data }: { data?: any[] }) {
  const { language, t } = useLanguage();
  const chartData = data || monthlyData;
  const maxValue = Math.max(...chartData.map((d) => d.revenue));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {t("monthlyRevenue")} & {language === "ar" ? "المصروفات" : "Expenses"}
        </h3>
        <button className="flex items-center space-x-2 text-green-primary hover:text-green-secondary">
          <Download className="w-4 h-4" />
          <span>{t("export")}</span>
        </button>
      </div>

      <div className="space-y-4">
        {chartData.map((item, index) => (
          <motion.div
            key={item.month}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-4"
          >
            <div className="w-8 text-sm font-medium text-gray-600">
              {item.month}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.revenue / maxValue) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                    className="bg-green-500 h-2 rounded-full"
                  />
                </div>
                <span className="text-sm font-medium text-green-600 w-16">
                  ${(item.revenue / 1000).toFixed(0)}K
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.expenses / maxValue) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                    className="bg-red-400 h-2 rounded-full"
                  />
                </div>
                <span className="text-sm font-medium text-red-600 w-16">
                  ${(item.expenses / 1000).toFixed(0)}K
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-gray-600">
            {language === "ar" ? "الإيرادات" : "Revenue"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-400 rounded-full" />
          <span className="text-gray-600">
            {language === "ar" ? "المصروفات" : "Expenses"}
          </span>
        </div>
      </div>
    </div>
  );
}



export default function FinancialDashboard() {
  const { language } = useLanguage();
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("month");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const { financialData, loading } = useFinancialData(selectedTimeFilter);

  if (loading || !financialData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const translations: Record<Language, any> = {
    ar: {
      dashboard: "لوحة التحكم",
      financial: "التقارير المالية",
      revenue: "الإيرادات",
      expenses: "المصروفات",
      profit: "صافي الربح",
      profitMargin: "هامش الربح",
      revenueAnalysis: "تحليل الإيرادات",
      expenseBreakdown: "تفصيل المصروفات",
      monthlyTrends: "الاتجاهات الشهرية",
      exportReport: "تصدير التقرير",
      thisWeek: "هذا الأسبوع",
      thisMonth: "هذا الشهر",
      thisQuarter: "هذا الربع",
      thisYear: "هذا العام",
      timeFilter: "تصفية الوقت",
      orders: "طلبات",
      growth: "النمو",
      salaries: "الرواتب",
      materials: "المواد الخام",
      utilities: "المرافق",
      maintenance: "الصيانة",
      other: "أخرى",
    },
    en: {
      dashboard: "Dashboard",
      financial: "Financial Reports",
      revenue: "Revenue",
      expenses: "Expenses",
      profit: "Net Profit",
      profitMargin: "Profit Margin",
      revenueAnalysis: "Revenue Analysis",
      expenseBreakdown: "Expense Breakdown",
      monthlyTrends: "Monthly Trends",
      exportReport: "Export Report",
      thisWeek: "This Week",
      thisMonth: "This Month",
      thisQuarter: "This Quarter",
      thisYear: "This Year",
      timeFilter: "Time Filter",
      orders: "Orders",
      growth: "Growth",
      salaries: "Salaries",
      materials: "Raw Materials",
      utilities: "Utilities",
      maintenance: "Maintenance",
      other: "Other",
    },
  };

  const t = (key: string) => translations[language]?.[key] || key;

  // Calculate expense breakdown with real data
  const salaryExpenses = financialData.employees.reduce((sum, emp) => sum + (emp.paid || emp.salary || 0), 0);
  const materialExpenses = 8000; // Could be calculated from inventory data
  const utilityExpenses = 2500;
  const maintenanceExpenses = 1800;
  const otherExpenses = Math.max(0, financialData.totalExpenses - salaryExpenses - materialExpenses - utilityExpenses - maintenanceExpenses);

  const expenseBreakdownData = [
    { name: t("salaries"), value: salaryExpenses, color: "#3B82F6" },
    { name: t("materials"), value: materialExpenses, color: "#EF4444" },
    { name: t("utilities"), value: utilityExpenses, color: "#10B981" },
    { name: t("maintenance"), value: maintenanceExpenses, color: "#F59E0B" },
    { name: t("other"), value: otherExpenses, color: "#8B5CF6" },
  ];

  // Generate real monthly data for charts
  const realMonthlyData = generateRealMonthlyData(financialData.invoices, financialData.employees);

  // Export function
  const exportReport = () => {
    const reportData = {
      period: timeFilters.find(f => f.id === selectedTimeFilter)?.label[language],
      revenue: financialData.currentRevenue,
      expenses: financialData.totalExpenses,
      profit: financialData.netProfit,
      profitMargin: financialData.profitMargin,
      invoices: financialData.invoices.length,
      exportDate: new Date().toLocaleDateString(),
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial-report-${selectedTimeFilter}.json`;
    link.click();
  };

  return (
    <motion.div
      className="space-y-4"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Breadcrumb */}
      <nav className="flex text-sm text-gray-500">
        <span>{t("dashboard")}</span>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{t("financial")}</span>
      </nav>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("financial")}</h1>
          <p className="text-gray-600 text-sm">{t("financialDesc")}</p>
        </div>
      </motion.div>

      {/* Time Filter and Export */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-end gap-4"
      >
        {/* Time Filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <Filter className="w-4 h-4 mr-2" />
            {timeFilters.find(f => f.id === selectedTimeFilter)?.label[language]}
            <ChevronDown className="w-4 h-4 ml-2" />
          </button>
          {showFilterDropdown && (
            <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {timeFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    setSelectedTimeFilter(filter.id);
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                    selectedTimeFilter === filter.id ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  {filter.label[language]}
                </button>
              ))}
            </div>
          )}
        </div>
          
        {/* Export Button */}
        <motion.button
          onClick={exportReport}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download className="w-4 h-4 mr-2" />
          {t("exportReport")}
        </motion.button>
      </motion.div>

      {/* Key Metrics */}
      <div className="responsive-grid container-safe">
        <MetricCard
          title={t("revenue")}
          value={`$${financialData.currentRevenue.toLocaleString()}`}
          change={`${financialData.revenueChange >= 0 ? '+' : ''}${financialData.revenueChange.toFixed(1)}%`}
          icon={DollarSign}
          color="bg-green-600"
        />
        <MetricCard
          title={t("expenses")}
          value={`$${financialData.totalExpenses.toLocaleString()}`}
          change="-5.2%"
          icon={TrendingDown}
          color="bg-blue-500"
        />
        <MetricCard
          title={t("profit")}
          value={`$${financialData.netProfit.toLocaleString()}`}
          change={financialData.netProfit > 0 ? "+18.7%" : "-5.2%"}
          icon={financialData.netProfit > 0 ? TrendingUp : TrendingDown}
          color={financialData.netProfit > 0 ? "bg-green-600" : "bg-red-600"}
        />
        <MetricCard
          title={t("profitMargin")}
          value={`${financialData.profitMargin.toFixed(1)}%`}
          change={financialData.profitMargin > 20 ? "+2.1%" : "-1.8%"}
          icon={PieChart}
          color={financialData.profitMargin > 20 ? "bg-green-500" : "bg-orange-500"}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 container-safe">
        <div>
          {/* Enhanced Expense Breakdown with Donut Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("expenseBreakdown")}
              </h3>
              <PieChart className="w-5 h-5 text-gray-500" />
            </div>
            <div className="grid grid-cols-1 gap-6">
              {/* Donut Chart - محسن للتوسيط */}
              <div className="flex items-center justify-center">
                <div className="w-full max-w-sm">
                  <InteractiveDonutChart data={expenseBreakdownData} language={language} />
                </div>
              </div>
              
              {/* Detailed Breakdown */}
              <div className="space-y-3">
                {expenseBreakdownData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {((item.value / financialData.totalExpenses) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${item.value.toLocaleString()}</p>
                      {item.name === t("salaries") && (
                        <p className="text-xs text-gray-500">
                          {language === "ar" ? `${financialData.employees.length} موظفين` : `${financialData.employees.length} employees`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <SimpleBarChart data={realMonthlyData} />
          
          {/* Invoice and Payment Statistics - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-lg bg-green-100 text-green-600 mb-3">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <p className="text-gray-600 text-xs mb-1">
                  {language === "ar" ? "فواتير مدفوعة" : "Paid Invoices"}
                </p>
                <p className="text-xl font-bold text-green-600">
                  {realFinancialData.paidInvoices}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-lg bg-red-100 text-red-600 mb-3">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <p className="text-gray-600 text-xs mb-1">
                  {language === "ar" ? "فواتير غير مدفوعة" : "Unpaid Invoices"}
                </p>
                <p className="text-xl font-bold text-red-600">
                  {realFinancialData.unpaidInvoices}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-lg bg-orange-100 text-orange-600 mb-3">
                  <Clock className="w-6 h-6" />
                </div>
                <p className="text-gray-600 text-xs mb-1">
                  {language === "ar" ? "مدفوعات معلقة" : "Outstanding"}
                </p>
                <p className="text-lg font-bold text-orange-600">
                  ${(realFinancialData.outstandingPayments / 1000).toFixed(0)}K
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-lg bg-red-100 text-red-600 mb-3">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <p className="text-gray-600 text-xs mb-1">
                  {language === "ar" ? "فواتير متأخرة" : "Overdue"}
                </p>
                <p className="text-lg font-bold text-red-600">
                  ${(realFinancialData.overdueAmount / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-gray-500">
                  {realFinancialData.overdueCount} {language === "ar" ? "فاتورة" : "invoices"}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Financial Summary Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {language === "ar"
              ? "الملخص المالي الشهري"
              : "Monthly Financial Summary"}
          </h3>
        </div>
        <div className="table-responsive">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {language === "ar" ? "الشهر" : "Month"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {language === "ar" ? "الإيرادات" : "Revenue"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {language === "ar" ? "المصروفات" : "Expenses"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {language === "ar" ? "الربح" : "Profit"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {language === "ar" ? "النمو" : "Growth"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {monthlyData.map((data, index) => {
                const growth =
                  index > 0
                    ? (
                        ((data.profit - monthlyData[index - 1].profit) /
                          monthlyData[index - 1].profit) *
                        100
                      ).toFixed(1)
                    : "0.0";
                const isPositiveGrowth = parseFloat(growth) >= 0;

                return (
                  <motion.tr
                    key={data.month}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {data.month}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${data.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${data.expenses.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                      ${data.profit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`flex items-center ${
                          isPositiveGrowth ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isPositiveGrowth ? (
                          <ArrowUpRight className="w-4 h-4 mr-1" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(parseFloat(growth))}%
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Data Consistency Verification - Removed as requested */}

      {/* Financial Alerts and Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
      </motion.div>
    </motion.div>
  );
}
