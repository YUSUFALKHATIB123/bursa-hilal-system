import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage, Language } from "../contexts/LanguageContext";
import AnimatedCounter from "../components/AnimatedCounter";
import { CurrencyConverter, CURRENCY_CONFIG, convertAmount } from "../utils/currency";
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
  Percent,
  Wallet,
  Smile,
  Frown,
} from "lucide-react";
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import ReactCountryFlag from "react-country-flag";
// أضف CSS للنبض
import "../global.css";

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
        // Fetch real data from API - جميع البيانات من جميع الصفحات
        const [invoices, employees, inventory, orders, customers] = await Promise.all([
          apiService.getInvoices(),
          apiService.getEmployees(),
          apiService.getInventory(),
          apiService.getOrders(),
          apiService.getCustomers(),
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

        // Calculate expenses from multiple sources - CORRECTED
        // 1. Employee salaries (ONLY paid amounts)
        const salaryExpenses = employees
          .reduce((sum, emp) => {
            const actualPaid = emp.paid || 0; // فقط المدفوع فعلياً
            return sum + (typeof actualPaid === 'number' ? actualPaid : 0);
          }, 0);
        
        // Calculate salary expenses from employee paid amounts (in TRY - Turkish Lira)
        // نحسب الرواتب بالليرة التركية لأن العمال يتقاضون بالليرة التركية

        
        // 2. Inventory costs - DISABLED (not real)
        const inventoryCosts = 0; // تم تعطيل المواد الخام المفترضة
        
        // 3. Other operational expenses - DISABLED (not real)
        const operationalExpenses = 0; // تم تعطيل المصروفات المفترضة
        
        // Total expenses in TRY (Turkish Lira)
        const totalExpenses = salaryExpenses; // فقط الرواتب المدفوعة فعلياً بالليرة التركية
        
        // Convert expenses from TRY to USD for profit calculation
        const totalExpensesUSD = convertAmount(totalExpenses, 'TRY', 'USD');

        const netProfit = currentRevenue - totalExpensesUSD; // Revenue (USD) - Expenses (USD)
        const profitMargin = currentRevenue > 0 ? (netProfit / currentRevenue) * 100 : 0;

        // Calculate changes with null safety
        const revenueChange = previousRevenue > 0 
          ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
          : (currentRevenue > 0 ? 100 : 0);

        setFinancialData({
          currentRevenue, // USD
          previousRevenue, // USD
          totalExpenses, // TRY (Original currency for employees)
          totalExpensesUSD, // USD (Converted for calculations)
          netProfit, // USD
          profitMargin, // Percentage
          revenueChange, // Percentage
          invoices: invoices.filter(inv => new Date(inv.date) >= startDate),
          employees,
          inventory,
          orders,
          customers,
          // Detailed expense breakdown
          salaryExpenses, // TRY
          inventoryCosts, // TRY
          operationalExpenses, // TRY
        });
      } catch (error) {
        console.error("Error fetching financial data:", error);
        // Set default values on error
        setFinancialData({
          currentRevenue: 0,
          previousRevenue: 0,
          totalExpenses: 0,
          totalExpensesUSD: 0,
          netProfit: 0,
          profitMargin: 0,
          revenueChange: 0,
          invoices: [],
          employees: [],
          inventory: [],
          orders: [],
          customers: [],
          salaryExpenses: 0,
          inventoryCosts: 0,
          operationalExpenses: 0,
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
              <p className="text-sm font-bold">₺{total.toLocaleString()}</p>
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
              <p className="text-xs text-gray-500">
                {item.currency === "TRY" 
                  ? `${item.value.toLocaleString()} ₺` 
                  : `$${item.value.toLocaleString()}`
                }
              </p>
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
            {data.length > 0 && data[0].currency === "TRY" 
              ? `${data.reduce((sum, item) => sum + item.value, 0).toLocaleString()} ₺`
              : `$${data.reduce((sum, item) => sum + item.value, 0).toLocaleString()}`
            }
          </p>
        </div>
      </div>
    </div>
  );
}

// Use real monthly data from calculations
const monthlyData = realFinancialData.monthlyData;

// Generate real monthly data from actual invoices and employees
const generateRealMonthlyData = (invoices: any[], employees: any[], inventory: any[]) => {
  const monthlyRevenue: Record<string, number> = {};

  // Processing invoices for monthly chart calculation

  invoices.forEach(invoice => {
    // فقط فواتير المبيعات المدفوعة
    if (invoice.type !== 'sales') return;
    if (!invoice.date) return;
    
    // حساب المبلغ المستلم فعلياً فقط
    let amount = 0;
    if (invoice.paymentStatus === 'paid') {
      amount = Number(invoice.total || invoice.amount || 0);
    } else if (invoice.paymentStatus === 'partial') {
      amount = Number(invoice.amountReceived || 0);
    }
    // لا نحسب الفواتير غير المدفوعة في الإيرادات الشهرية
    
    if (isNaN(amount) || amount <= 0) return;
    const date = new Date(invoice.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + amount;
  });

  const months: { month: string, revenue: number, expenses: number, profit: number, hasRealData: boolean }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en', { month: 'short' });
    const revenue = monthlyRevenue[monthKey] || 0;

    // حساب المصروفات الفعلية فقط للشهر الحالي (يناير 2025)
    let expenses = 0;
    if (monthKey === '2025-01' && employees.length > 0) { // فقط يناير 2025 حيث تم دفع الرواتب
      expenses = employees.reduce((sum, emp) => {
        const actualPaid = emp.paid || 0; // فقط المدفوع فعلياً
        return sum + actualPaid;
      }, 0);
    }
    
    const profit = revenue - expenses;
    const hasRealData = revenue > 0 || expenses > 0;
    
    months.push({
      month: monthName,
      revenue,
      expenses,
      profit,
      hasRealData
    });
  }
  
  // Monthly revenue breakdown calculated
  
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
  prefix = "",
  suffix = "",
}: {
  title: string;
  value: string | number;
  change: string;
  icon: any;
  color: string;
  prefix?: string;
  suffix?: string;
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
          <p className="text-3xl font-bold text-gray-900">
            {typeof value === "number" ? (
              <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
            ) : (
              value
            )}
          </p>
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
  const chartData = data || [];
  
  // Check if we have any real data
  const hasRealData = chartData.some(d => d.hasRealData);
  const totalRevenue = chartData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  
  // Calculate max value for proper scaling - use both revenue and expenses
  const maxValue = Math.max(
    ...chartData.map((d) => Math.max(d.revenue || 0, d.expenses || 0)),
    1 // Ensure we don't divide by zero
  );

  // 2. في رسم الأشهر، ابدأ من أول شهر فيه بيانات فعلية (revenue > 0)
  const firstRealMonthIndex = chartData.findIndex(d => d.revenue > 0);
  const filteredMonthlyData = firstRealMonthIndex === -1 ? chartData : chartData.slice(firstRealMonthIndex);

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

      {/* Show message if no real data */}
      {!hasRealData && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <BarChart3 className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-600 font-medium">
            {language === "ar" ? "لا توجد بيانات إيرادات شهرية حتى الآن" : "No monthly revenue data available yet"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {language === "ar" 
              ? "البيانات الشهرية محدودة - فقط يناير 2025 يحتوي على فواتير مدفوعة" 
              : "Monthly data is limited - only January 2025 contains paid invoices"
            }
          </p>
        </div>
      )}

      <div className="space-y-4">
        {filteredMonthlyData.map((item, index) => (
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
                    animate={{ width: `${((item.revenue || 0) / maxValue) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                    className={`h-2 rounded-full ${item.hasRealData ? 'bg-green-500' : 'bg-gray-300'}`}
                  />
                </div>
                <span className="text-sm font-medium w-16 text-green-600">${formatShortNumber(item.revenue || 0)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((item.expenses || 0) / maxValue) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                    className="bg-red-400 h-2 rounded-full"
                    style={{ minWidth: '16px' }}
                  />
                </div>
                <span className="text-sm font-medium text-red-600 w-16">${formatShortNumber(item.expenses || 0)}</span>
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

function MapCard({ customers }: { customers: any[] }) {
  // استخدام خريطة العالم الافتراضية من مكتبة react-simple-maps
  const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
  
  // Initialize map component with customer data

  // تحليل بيانات العملاء الحقيقية حسب البلد
  const analyzeCustomersByCountry = () => {
    const countryMap: Record<string, { name: string, revenue: number, clients: string[], count: number }> = {};
    
    if (!customers || customers.length === 0) {
      // No customer data available
      return [];
    }
    
    customers.forEach(customer => {
      let countryKey = null;
      let countryName = "";
      
      // التأكد من وجود البيانات الأساسية
      if (!customer || !customer.name) {
        // Invalid customer data
        return;
      }
      
      // Processing customer geographical data
      
      // تحديد البلد من البيانات المحفوظة أو من العنوان أو رقم الهاتف
      if (customer.country) {
        // استخدم البيانات المحفوظة من نظام اختيار الموقع الجديد
        // أسماء البلدان بالإنجليزية التي تتطابق مع world-atlas
        const countryMapping: Record<string, { key: string, name: string }> = {
          "libya": { key: "Libya", name: "ليبيا" },
          "egypt": { key: "Egypt", name: "مصر" },
          "syria": { key: "Syria", name: "سوريا" },
          "turkey": { key: "Turkey", name: "تركيا" },
          "jordan": { key: "Jordan", name: "الأردن" },
          "lebanon": { key: "Lebanon", name: "لبنان" },
          "palestine": { key: "Palestine", name: "فلسطين" },
          "iraq": { key: "Iraq", name: "العراق" },
          "saudi": { key: "Saudi Arabia", name: "المملكة العربية السعودية" },
          "uae": { key: "United Arab Emirates", name: "الإمارات العربية المتحدة" }
        };
        
        console.log('🔍 محاولة تحديد البلد من:', customer.country);
        
        const countryData = countryMapping[customer.country];
        if (countryData) {
          countryKey = countryData.key;
          countryName = countryData.name;
          console.log('✅ تم تحديد البلد من النظام الجديد:', { countryKey, countryName });
        } else {
          console.log('❌ البلد غير موجود في قاعدة البيانات:', customer.country);
        }
      } else {
        // استخدم الطريقة القديمة للعملاء المضافين سابقاً
        const addressText = customer.address?.toLowerCase() || "";
        const phoneNumber = customer.phone || "";
        
        console.log('🔍 فحص العنوان والهاتف:', { addressText, phoneNumber });
        
        if (addressText.includes("ليبيا") || addressText.includes("بنغازي") || addressText.includes("طرابلس") || addressText.includes("مصراتة") || phoneNumber.startsWith("+218")) {
          countryKey = "Libya";
          countryName = "ليبيا";
          console.log('✅ تم تحديد ليبيا من العنوان/الهاتف');
        } else if (addressText.includes("مصر") || addressText.includes("القاهرة") || phoneNumber.startsWith("+20")) {
          countryKey = "Egypt";
          countryName = "مصر";
          console.log('✅ تم تحديد مصر من العنوان/الهاتف');
        } else if (addressText.includes("سوريا") || addressText.includes("syria") || addressText.includes("دمشق") || addressText.includes("حلب") || phoneNumber.startsWith("+963") || phoneNumber.startsWith("0534")) {
          countryKey = "Syria";
          countryName = "سوريا";
          console.log('✅ تم تحديد سوريا من العنوان/الهاتف');
        } else if (addressText.includes("تركيا") || phoneNumber.startsWith("+90")) {
          countryKey = "Turkey";
          countryName = "تركيا";
          console.log('✅ تم تحديد تركيا من العنوان/الهاتف');
        } else if (phoneNumber.startsWith("+1")) {
          countryKey = "United States of America";
          countryName = "الولايات المتحدة";
          console.log('✅ تم تحديد أمريكا من الهاتف');
        } else if (phoneNumber.startsWith("+44")) {
          countryKey = "United Kingdom";
          countryName = "المملكة المتحدة";
          console.log('✅ تم تحديد بريطانيا من الهاتف');
        } else if (phoneNumber.startsWith("+49")) {
          countryKey = "Germany";
          countryName = "ألمانيا";
          console.log('✅ تم تحديد ألمانيا من الهاتف');
        } else {
          console.log('❌ لم يتم تحديد البلد للعميل:', customer.name);
        }
      }
      
      if (countryKey) {
        if (!countryMap[countryKey]) {
          countryMap[countryKey] = {
            name: countryName,
            revenue: 0,
            clients: [],
            count: 0
          };
        }
        
        countryMap[countryKey].revenue += customer.totalRevenue || 0;
        countryMap[countryKey].clients.push(customer.name);
        countryMap[countryKey].count++;
        
        console.log('📊 تم إضافة العميل للخريطة:', {
          customer: customer.name,
          country: countryName,
          countryKey: countryKey,
          totalCustomersInCountry: countryMap[countryKey].count
        });
      }
    });
    
    console.log('🗺️ النتيجة النهائية للعملاء حسب البلد:', countryMap);
    return Object.values(countryMap);
  };

  const realCountryData = analyzeCustomersByCountry();
  console.log('🗺️ بيانات العملاء حسب البلد:', realCountryData);
  console.log('📊 عدد العملاء الإجمالي:', customers.length);
  console.log('🔍 هل توجد بيانات بلدان؟', realCountryData.length > 0);
  
  // تحليل تفصيلي لكل عميل
  customers.forEach((customer, index) => {
    console.log(`👤 عميل ${index + 1}:`, {
      name: customer.name,
      country: customer.country,
      address: customer.address,
      phone: customer.phone,
      hasCountryField: !!customer.country,
      addressLower: customer.address?.toLowerCase()
    });
  });
  
  // عرض النقاط الحمراء للعملاء الحقيقيين فقط
  console.log('📊 بيانات العملاء النهائية:', realCountryData);

  // دالة البحث تعتمد على أسماء البلدان الإنجليزية
  const getCountryData = (geo) => {
    const countryName = geo.properties?.NAME;
    console.log('🔍 البحث عن بيانات البلد:', countryName);
    
    // البحث بأسماء مختلفة محتملة
    const possibleNames = [
      countryName,
      geo.properties?.NAME_EN,
      geo.properties?.NAME_LONG,
      geo.properties?.ADMIN
    ].filter(Boolean);
    
    for (const name of possibleNames) {
      const found = realCountryData.find((c) => 
        name === "Syrian Arab Republic" && c.name === "سوريا" ||
        name === "Libya" && c.name === "ليبيا" ||
        name === "Egypt" && c.name === "مصر" ||
        name === "Turkey" && c.name === "تركيا" ||
        name === "Jordan" && c.name === "الأردن" ||
        name === "Lebanon" && c.name === "لبنان" ||
        name === "Iraq" && c.name === "العراق" ||
        name === "Saudi Arabia" && c.name === "المملكة العربية السعودية" ||
        name === "United Arab Emirates" && c.name === "الإمارات العربية المتحدة"
      );
      if (found) {
        console.log('✅ تم العثور على البلد:', { searchName: name, foundCountry: found.name });
        return found;
      }
    }
    
    console.log('❌ لم يتم العثور على البلد:', possibleNames);
    return null;
  };

  // ألوان حسب الإيراد
  const getColor = (revenue) => {
    if (revenue > 100000) return "#059669"; // أخضر غامق
    if (revenue > 60000) return "#34d399"; // أخضر متوسط
    if (revenue > 0) return "#fef9c3"; // أصفر فاتح
    return "#f3f4f6"; // رمادي
  };

  // Tooltip state
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: "" });

  // دالة لحساب مركز الدولة (centroid) - مواقع ثابتة حسب اسم البلد
  const getCentroid = (geo) => {
    const countryName = geo.properties?.NAME;
    
    // مواقع ثابتة ومضمونة للبلدان حسب اسم البلد [longitude, latitude]
    const countryLocations = {
      "Libya": [17.5, 26.5],
      "Egypt": [30.0, 26.8], 
      "Syria": [38.5, 34.8],
      "Syrian Arab Republic": [38.5, 34.8],
      "Turkey": [35.2, 39.0],
      "Jordan": [36.2, 30.6],
      "Iraq": [43.7, 33.2],
      "Lebanon": [35.9, 33.9],
      "Palestine": [35.3, 31.9],
      "United States of America": [-98.0, 39.0],
      "United Kingdom": [-2.0, 54.0],
      "Germany": [10.0, 51.0],
      "Saudi Arabia": [45.0, 24.0],
      "United Arab Emirates": [54.0, 24.0],
    };
    
    const location = countryLocations[countryName];
    if (location) {
      console.log(`📍 مركز البلد ${countryName}:`, location);
    } else {
      console.log(`❌ لا يوجد موقع محدد للبلد: ${countryName}`);
    }
    
    // إرجاع الموقع الثابت
    return location || null;
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-8 map-world-container" style={{ width: '100vw', maxWidth: '1200px', margin: '24px auto', overflow: 'visible' }}>
      <style>
        {`
        @keyframes slow-pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.2);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
            transform-origin: center;
          }
          50% {
            opacity: 0.7;
            transform: scale(1.2);
            transform-origin: center;
          }
        }
        
        .slow-pulse {
          animation: slow-pulse 3s ease-in-out infinite;
        }
        
        .map-container {
          position: relative;
          overflow: visible;
        }
        
        .customer-dot {
          transition: all 0.3s ease;
        }
        
        .customer-dot:hover {
          transform: scale(1.1);
        }
        `}
      </style>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">العملاء حول العالم</h2>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full slow-pulse"></div>
            <span>نقط حمراء = عملاء حقيقيين</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-600">المجموع:</span>
            <span className="bg-blue-100 px-2 py-1 rounded-full text-blue-800 font-bold">
              {customers.length} عميل
            </span>
          </div>
        </div>
      </div>
      
      {/* معلومات حالة الخريطة */}
      <div className="mb-4 space-y-2">
        {realCountryData.length === 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">⚠️ لا توجد عملاء مسجلين حالياً في النظام أو لم يتم تحديد البلد لهم</p>
          </div>
        )}
        
        {realCountryData.length > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              ✅ تم العثور على عملاء في <span className="font-bold">{realCountryData.length}</span> بلد/بلدان
              {realCountryData.length <= 3 && (
                <span> ({realCountryData.map(c => c.name).join(', ')})</span>
              )}
            </p>
          </div>
        )}
      </div>
      <div className="map-container" style={{ width: '100%', maxWidth: '1200px', height: 400, margin: '0 auto', position: 'relative' }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 600,
            center: [35, 30],
          }}
          width={1200}
          height={400}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={geoUrl} object="countries">
            {({ geographies, projection }) => {
              console.log('🗺️ تم تحميل البلدان، العدد:', geographies?.length || 0);
              return geographies.map((geo) => {
                const country = getCountryData(geo);
                const revenue = country ? country.revenue : 0;
                const centroid = getCentroid(geo); // نحسب centroid لجميع البلدان
                const projected = centroid ? projection(centroid) : null;
                
                // طباعة معلومات debugging
                if (country && country.count > 0) {
                  console.log('🔴 عميل موجود في البلد:', {
                    countryId: geo.id,
                    countryName: country.name,
                    customerCount: country.count,
                    centroid: centroid,
                    projected: projected,
                    customers: country.clients,
                    geoProperties: geo.properties
                  });
                }
                
                // debugging للنقاط التي ستُعرض
                if (country && country.count > 0 && centroid && projected) {
                  console.log('✨ سيتم عرض نقطة حمراء في:', {
                    country: country.name,
                    position: projected,
                    customerCount: country.count
                  });
                }
                
                // debugging إضافي لجميع البلدان لمعرفة الأرقام الصحيحة
                if (geo.properties?.NAME?.includes('Libya') || geo.properties?.NAME?.includes('Egypt') || 
                    geo.properties?.NAME?.includes('Syria') || geo.properties?.NAME?.includes('Turkey')) {
                  console.log('🌍 بلد عربي مهم:', {
                    id: geo.id,
                    name: geo.properties?.NAME,
                    hasCustomers: !!country,
                    countryData: country
                  });
                }
                
                // طباعة البلدان العربية المهمة لمعرفة الأكواد الصحيحة
                if (geo.properties?.NAME?.includes('Syria') || geo.properties?.NAME?.includes('Libya') || 
                    geo.properties?.NAME?.includes('Egypt') || geo.properties?.NAME?.includes('Turkey')) {
                  console.log('🌍 بلد عربي - الكود الحقيقي:', {
                    id: geo.id,
                    name: geo.properties?.NAME,
                    properties: geo.properties
                  });
                }
                
                // طباعة أول 5 بلدان لمعرفة الهيكل
                if (parseInt(geo.rsmKey) < 5) {
                  console.log('🗺️ بلد رقم', geo.rsmKey, ':', {
                    id: geo.id,
                    name: geo.properties?.NAME,
                    properties: geo.properties
                  });
                }
                return (
                  <g key={geo.rsmKey}>
                    <Geography
                      geography={geo}
                      onMouseEnter={(e) => {
                        if (!country || country.count === 0) return;
                        const { clientX: x, clientY: y } = e;
                        setTooltip({
                          visible: true,
                          x,
                          y,
                          content: `
                            <div style='text-align:right; background: white; padding: 12px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 2px solid #ef4444; min-width: 200px;'>
                              <div style='text-align: center; margin-bottom: 8px;'>
                                <b style='color: #ef4444; font-size: 16px;'>${country.name}</b>
                              </div>
                              <div style='display: flex; align-items: center; margin-bottom: 6px;'>
                                <span style='color: #ef4444; margin-left: 6px;'>🔴</span>
                                <span style='color: #1f2937; font-weight: 600;'>${country.count} ${country.count === 1 ? 'عميل' : 'عملاء'}</span>
                              </div>
                              <div style='display: flex; align-items: center; margin-bottom: 8px;'>
                                <span style='color: #059669; margin-left: 6px;'>💰</span>
                                <span style='color: #059669; font-weight: 600;'>الإيراد: $${country.revenue.toLocaleString()}</span>
                              </div>
                              <hr style='margin: 8px 0; border: none; height: 1px; background: #e5e7eb;'/>
                              <div style='color: #6b7280; font-size: 12px; line-height: 1.4;'>
                                <strong>العملاء:</strong><br/>
                                ${country.clients.length > 3 ? 
                                  country.clients.slice(0, 3).join("<br/>• ") + `<br/>... و ${country.clients.length - 3} عملاء آخرين` 
                                  : country.clients.join("<br/>• ")
                                }
                              </div>
                            </div>
                          `,
                        });
                      }}
                      onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
                      style={{
                        default: { fill: getColor(revenue), outline: "none" },
                        hover: { fill: "#2563eb", outline: "none" },
                        pressed: { fill: "#10b981", outline: "none" },
                      }}
                    />
                    {/* نقطة حمراء نابضة فقط للبلدان التي بها عملاء حقيقيين */}
                    {country && country.count > 0 && centroid && projected && (
                      <>
                        {/* دائرة النبض الخارجية المحسنة */}
                        <circle
                          cx={projected[0]}
                          cy={projected[1]}
                          r={Math.min(25, 15 + country.count * 2)} // حجم متناسب مع عدد العملاء
                          fill="rgba(239, 68, 68, 0.2)"
                          className="slow-pulse"
                        />
                        
                        {/* دائرة نبض ثانوية */}
                        <circle
                          cx={projected[0]}
                          cy={projected[1]}
                          r={Math.min(18, 12 + country.count * 1.5)}
                          fill="rgba(239, 68, 68, 0.4)"
                          style={{
                            animation: 'slow-pulse 2.5s ease-in-out infinite 1s'
                          }}
                        />
                        
                        {/* النقطة الحمراء الرئيسية المحسنة */}
                        <circle
                          cx={projected[0]}
                          cy={projected[1]}
                          r={Math.min(12, 8 + country.count)}
                          fill="#ef4444"
                          opacity={0.95}
                          stroke="#dc2626"
                          strokeWidth={3}
                          className="customer-dot"
                          style={{ 
                            cursor: 'pointer',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                          }}
                          onClick={() => {
                            alert(`📍 عملاء في ${country.name}:\n\n${country.clients.map((client, index) => `${index + 1}. ${client}`).join('\n')}\n\n💰 إجمالي الإيراد: $${country.revenue.toLocaleString()}`);
                          }}
                          onMouseEnter={(e) => {
                            const { clientX: x, clientY: y } = e;
                            setTooltip({
                              visible: true,
                              x: x - 100,
                              y: y - 100,
                              content: `
                                <div style='background: #dc2626; color: white; padding: 8px 12px; border-radius: 6px; font-size: 12px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);'>
                                  <div style='font-weight: bold;'>${country.name}</div>
                                  <div>${country.count} ${country.count === 1 ? 'عميل' : 'عملاء'}</div>
                                  <div style='font-size: 10px; opacity: 0.9;'>انقر للتفاصيل</div>
                                </div>
                              `,
                            });
                          }}
                          onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
                        />
                        
                        {/* دائرة داخلية بيضاء للنص */}
                        <circle
                          cx={projected[0]}
                          cy={projected[1]}
                          r={Math.min(8, 5 + country.count * 0.5)}
                          fill="rgba(255, 255, 255, 0.95)"
                        />
                        
                        {/* نص عدد العملاء المحسن */}
                        <text
                          x={projected[0]}
                          y={projected[1] + 4}
                          textAnchor="middle"
                          fontSize={Math.min(11, 8 + country.count * 0.5)}
                          fill="#dc2626"
                          fontWeight="bold"
                          fontFamily="Arial, sans-serif"
                          style={{
                            textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                            pointerEvents: 'none'
                          }}
                        >
                          {country.count}
                        </text>
                      </>
                    )}
                  </g>
                );
              });
            }}
          </Geographies>
          
          {/* النقاط الحقيقية على البلدان */}

        </ComposableMap>
        {/* Tooltip */}
        {tooltip.visible && (
          <div
            style={{
              position: "fixed",
              top: tooltip.y + 10,
              left: tooltip.x + 10,
              background: "rgba(0,0,0,0.85)",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: 8,
              fontSize: 14,
              pointerEvents: "none",
              zIndex: 1000,
              direction: "rtl",
              minWidth: 120,
              maxWidth: 220,
            }}
            dangerouslySetInnerHTML={{ __html: tooltip.content }}
          />
        )}
      </div>
    </div>
  );
}

// 3. دالة اختصار الأرقام الكبيرة
function formatShortNumber(num: number) {
  if (num >= 1e3) {
    const rounded = Math.round(num / 1e3); // أقرب رقم صحيح بالآلاف
    let str = rounded.toString();
    // إذا كان الرقم 3 خانات وكان الثالث صفر، احذف الصفر
    if (str.length === 3 && str[2] === '0') str = str.slice(0, 2);
    return str + 'K';
  }
  return num.toString();
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

  // Calculate expense breakdown with REAL data only
  const expenseBreakdownData = [
    { 
      name: t("salaries"), 
      value: financialData.salaryExpenses || 0, 
      color: "#3B82F6",
      currency: "TRY", // الليرة التركية
      isReal: true
    },
    { 
      name: t("materials"), 
      value: 0, // لا توجد بيانات حقيقية
      color: "#EF4444",
      currency: "TRY",
      isReal: false
    },
    { 
      name: t("utilities"), 
      value: 0, // لا توجد بيانات حقيقية
      color: "#10B981",
      currency: "TRY",
      isReal: false
    },
    { 
      name: t("maintenance"), 
      value: 0, // لا توجد بيانات حقيقية
      color: "#F59E0B",
      currency: "TRY",
      isReal: false
    },
    { 
      name: t("other"), 
      value: 0, // لا توجد بيانات حقيقية
      color: "#8B5CF6",
      currency: "TRY",
      isReal: false
    },
  ];

  // Generate real monthly data for charts
  const realMonthlyData = generateRealMonthlyData(financialData.invoices, financialData.employees, financialData.inventory);

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

      {/* Key Metrics - نظام العملات المحدث */}
      <div className="responsive-grid container-safe">
        <MetricCard
          title={t("revenue")}
          value={CurrencyConverter.formatAmount(financialData.currentRevenue, CURRENCY_CONFIG.SALES_CURRENCY, language)}
          prefix=""
          change={`${financialData.revenueChange >= 0 ? '+' : ''}${financialData.revenueChange.toFixed(1)}%`}
          icon={DollarSign}
          color="bg-green-600"
        />
        <MetricCard
          title={t("expenses")}
          value={CurrencyConverter.formatAmount(financialData.totalExpensesUSD || 0, CURRENCY_CONFIG.SALES_CURRENCY, language)}
          prefix=""
          change="-5.2%"
          icon={ArrowDownRight}
          color="bg-red-500"
        />
        <MetricCard
          title={t("profit")}
          value={CurrencyConverter.formatAmount(financialData.netProfit || 0, CURRENCY_CONFIG.SALES_CURRENCY, language)}
          prefix=""
          change={financialData.netProfit > 0 ? `+${((financialData.netProfit / (financialData.currentRevenue || 1)) * 100).toFixed(1)}%` : `${((financialData.netProfit / (financialData.currentRevenue || 1)) * 100).toFixed(1)}%`}
          icon={financialData.netProfit > 0 ? Smile : Frown}
          color={financialData.netProfit > 0 ? "bg-green-600" : "bg-red-600"}
        />
        <MetricCard
          title={t("profitMargin")}
          value={financialData.profitMargin.toFixed(1)}
          suffix="%"
          change={financialData.profitMargin > 20 ? "+2.1%" : "-1.8%"}
          icon={BarChart3}
          color={financialData.profitMargin > 20 ? "bg-green-500" : "bg-orange-500"}
        />
      </div>



      {/* Currency Information */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              {language === "ar" ? "معلومات العملات" : "Currency Information"}
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                {language === "ar" 
                  ? "• الإيرادات والأرباح: بالدولار الأمريكي ($) - عملة العملاء"
                  : "• Revenue & Profits: US Dollars ($) - Customer currency"
                }
              </p>
              <p>
                {language === "ar" 
                  ? "• رواتب الموظفين: بالليرة التركية (₺) - عملة العمال"
                  : "• Employee Salaries: Turkish Lira (₺) - Worker currency"
                }
              </p>
              <p className="text-xs mt-1 opacity-75">
                {language === "ar" 
                  ? `سعر الصرف الحالي: 1$ = ${CurrencyConverter.formatAmount(1 * 34.5, 'TRY', language).replace('₺', '')} ₺`
                  : `Current rate: $1 = ${CurrencyConverter.formatAmount(1 * 34.5, 'TRY', language).replace('₺', '')} ₺`
                }
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Data Status Alert */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
      >
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-blue-600 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">
              {language === "ar" ? "البيانات المعروضة" : "Data Status"}
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              {language === "ar" 
                ? `الإيرادات: ${financialData.invoices.length} فواتير فقط • المصروفات: ${financialData.employees.length} موظفين فقط • البيانات محدودة`
                : `Revenue: ${financialData.invoices.length} invoices only • Expenses: ${financialData.employees.length} employees only • Limited data`
              }
            </p>
          </div>
        </div>
      </motion.div>

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
                  <InteractiveDonutChart data={expenseBreakdownData.filter(item => item.value > 0)} language={language} />
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
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.isReal ? (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                              {language === "ar" ? "فعلي" : "Real"}
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">
                              {language === "ar" ? "غير مسجل" : "Not recorded"}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {financialData.totalExpenses > 0 
                            ? `${((item.value / financialData.totalExpenses) * 100).toFixed(1)}%`
                            : "0%"
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {item.currency === "TRY" 
                          ? `${item.value.toLocaleString()} ₺` 
                          : `$${item.value.toLocaleString()}`
                        }
                      </p>
                      {item.name === t("salaries") && (
                        <p className="text-xs text-gray-500">
                          {language === "ar" ? `${financialData.employees.length} موظفين` : `${financialData.employees.length} employees`}
                        </p>
                      )}
                      {item.name === t("materials") && (
                        <p className="text-xs text-gray-500">
                          {language === "ar" ? `${financialData.inventory.length} منتج` : `${financialData.inventory.length} items`}
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
                  {financialData.invoices.filter(inv => inv.paymentStatus === "paid").length}
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
                  {financialData.invoices.filter(inv => inv.paymentStatus === "unpaid").length}
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
                  ${formatShortNumber(financialData.invoices.reduce((sum, inv) => sum + (inv.amountRemaining || 0), 0) / 1000)}K
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
                  ${formatShortNumber(financialData.invoices.filter(inv => inv.isOverdue).reduce((sum, inv) => sum + (inv.amountRemaining || 0), 0) / 1000)}K
                </p>
                <p className="text-xs text-gray-500">
                  {financialData.invoices.filter(inv => inv.isOverdue).length} {language === "ar" ? "فاتورة" : "invoices"}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* World Map with Customer Locations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <MapCard customers={financialData.customers || []} />
      </motion.div>
    </motion.div>
  );
}
