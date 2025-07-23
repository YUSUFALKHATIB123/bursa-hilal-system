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

// Animated Counter Component
function AnimatedCounter({
  value,
  duration = 2000,
  suffix = "",
  prefix = "",
}: {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

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
        const [invoices, employees, inventory, orders] = await Promise.all([
          apiService.getInvoices(),
          apiService.getEmployees(),
          apiService.getInventory(),
          apiService.getOrders(),
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

        // Calculate expenses from multiple sources
        // 1. Employee salaries
        const salaryExpenses = employees
          .reduce((sum, emp) => {
            const salary = emp.paid || emp.salary || 0;
            return sum + (typeof salary === 'number' ? salary : 0);
          }, 0);
        
        // 2. Inventory costs (30% of inventory value as raw materials)
        const inventoryCosts = inventory
          .reduce((sum, item) => {
            const value = (item.quantity || 0) * (item.price || 0) * 0.3;
            return sum + (typeof value === 'number' ? value : 0);
          }, 0);
        
        // 3. Other operational expenses (utilities, maintenance, etc.)
        const operationalExpenses = 15000; // Base operational costs
        
        const totalExpenses = salaryExpenses + inventoryCosts + operationalExpenses;

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
          inventory,
          orders,
          // Detailed expense breakdown
          salaryExpenses,
          inventoryCosts,
          operationalExpenses,
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
          inventory: [],
          orders: [],
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
const generateRealMonthlyData = (invoices: any[], employees: any[], inventory: any[]) => {
  const monthlyRevenue: Record<string, number> = {};

  invoices.forEach(invoice => {
    // فقط فواتير المبيعات وبقيمة رقمية صحيحة
    if (invoice.type !== 'sales') return;
    if (!invoice.date) return;
    const amount = Number(invoice.amountReceived || invoice.total || invoice.amount || 0);
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

    // مصروفات هذا الشهر (ثابتة أو يمكن تعديلها حسب بياناتك)
    let salaryExpenses = 0;
    let inventoryCosts = 0;
    if (employees.length > 0) {
      salaryExpenses = employees.reduce((sum, emp) => {
        const salary = emp.paid || emp.salary || 0;
        return sum + salary;
      }, 0);
    }
    if (inventory.length > 0) {
      inventoryCosts = inventory.reduce((sum, item) => {
        const value = (item.quantity || 0) * (item.price || 0) * 0.3;
        return sum + value;
      }, 0);
    }
    const baseExpenses = 15000;
    const avgMonthlyExpenses = salaryExpenses + inventoryCosts + baseExpenses;
    // المصروفات تظهر إذا كان هناك إيرادات أو إذا كان هناك موظفين أو مخزون (أي بيانات حقيقية)
    const expenses = (revenue > 0 || salaryExpenses > 0 || inventoryCosts > 0) ? avgMonthlyExpenses : 0;
    const profit = revenue - expenses;
    months.push({
      month: monthName,
      revenue,
      expenses,
      profit,
      hasRealData: revenue > 0
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
              ? "ستظهر البيانات هنا عند إضافة فواتير جديدة" 
              : "Data will appear here when new invoices are added"
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

function MapCard() {
  // استخدم المسار المحلي للملف TopoJSON
  const geoUrl = "/custom.geo.json";

  // بيانات وهمية: استخدم الأكواد الرقمية geo.id
  const dummyData = [
    { code: 760, name: "سوريا", revenue: 70000, clients: ["عميل دمشق", "عميل حلب"] },
    { code: 792, name: "تركيا", revenue: 120000, clients: ["عميل اسطنبول", "عميل بورصة", "عميل أنقرة", "عميل إزمير"] },
    { code: 434, name: "ليبيا", revenue: 45000, clients: ["عميل طرابلس"] },
  ];

  // دالة البحث تعتمد فقط على geo.id
  const getCountryData = (geo) => {
    return dummyData.find((c) => c.code === geo.id);
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

  // دالة لحساب مركز الدولة (centroid)
  const getCentroid = (geo) => {
    // إذا كان geo.geometry موجود
    if (geo && geo.geometry) {
      // استخدم مكتبة d3-geo لحساب centroid
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const d3 = require("d3-geo");
        return d3.geoCentroid(geo);
      } catch {
        // fallback: مركز مستطيل الباوندرز
        if (geo.properties && geo.properties.LABEL_X && geo.properties.LABEL_Y) {
          return [geo.properties.LABEL_X, geo.properties.LABEL_Y];
        }
      }
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-8" style={{ width: '100vw', maxWidth: '1200px', margin: '24px auto', overflow: 'visible' }}>
      <h2 className="text-lg font-bold mb-4">الخريطة الجغرافية (سوريا، ليبيا، تركيا)</h2>
      <div style={{ width: '100%', maxWidth: '1200px', height: 400, margin: '0 auto', position: 'relative' }}>
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
            {({ geographies, projection }) =>
              geographies.map((geo) => {
                const country = getCountryData(geo);
                const revenue = country ? country.revenue : 0;
                const centroid = country ? getCentroid(geo) : null;
                const projected = centroid ? projection(centroid) : null;
                if (country && centroid && projected) {
                  console.log('id:', geo.id, 'centroid:', centroid, 'projected:', projected);
                }
                return (
                  <g key={geo.rsmKey}>
                    <Geography
                      geography={geo}
                      onMouseEnter={(e) => {
                        if (!country) return;
                        const { clientX: x, clientY: y } = e;
                        setTooltip({
                          visible: true,
                          x,
                          y,
                          content: `
                            <div style='text-align:right;'>
                              <b>${country.name}</b><br/>
                              العملاء: ${country.clients.length > 3 ? country.clients.length + " عملاء" : country.clients.join(", ")}<br/>
                              الإيراد: ${country.revenue.toLocaleString()} ج.م
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
                    {/* دائرة حمراء ثابتة على centroid */}
                    {country && centroid && projected && (
                      <circle
                        cx={projected[0]}
                        cy={projected[1]}
                        r={14}
                        fill="red"
                        opacity={0.7}
                      />
                    )}
                  </g>
                );
              })
            }
          </Geographies>
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

  // Calculate expense breakdown with real data from multiple sources
  const expenseBreakdownData = [
    { name: t("salaries"), value: financialData.salaryExpenses, color: "#3B82F6" },
    { name: t("materials"), value: financialData.inventoryCosts, color: "#EF4444" },
    { name: t("utilities"), value: financialData.operationalExpenses * 0.4, color: "#10B981" },
    { name: t("maintenance"), value: financialData.operationalExpenses * 0.3, color: "#F59E0B" },
    { name: t("other"), value: financialData.operationalExpenses * 0.3, color: "#8B5CF6" },
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

      {/* Key Metrics */}
      <div className="responsive-grid container-safe">
        <MetricCard
          title={t("revenue")}
          value={formatShortNumber(financialData.currentRevenue)}
          prefix="$"
          change={`${financialData.revenueChange >= 0 ? '+' : ''}${financialData.revenueChange.toFixed(1)}%`}
          icon={DollarSign}
          color="bg-green-600"
        />
        <MetricCard
          title={t("expenses")}
          value={formatShortNumber(financialData.totalExpenses)}
          prefix="$"
          change="-5.2%"
          icon={ArrowDownRight}
          color="bg-red-500"
        />
        <MetricCard
          title={t("profit")}
          value={financialData.netProfit}
          prefix="$"
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

      {/* Data Status Alert */}
      {financialData.invoices.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">
                {language === "ar" ? "لا توجد فواتير في النظام" : "No invoices in the system"}
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                {language === "ar" 
                  ? "الإيرادات والمصروفات ستظهر عند إضافة فواتير وموظفين ومخزون"
                  : "Revenue and expenses will appear when invoices, employees, and inventory are added"
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}

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

      {/* Financial Alerts and Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <MapCard />
      </motion.div>
    </motion.div>
  );
}
