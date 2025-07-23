import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { showErrorToast } from "../utils/toast";
import apiService from "../services/api";
import {
  Package,
  Plus,
  Minus,
  Calendar,
  User,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface StockMovement {
  id: string;
  itemId: string;
  type: string;
  color: string;
  quantity: number;
  operation: "in" | "out";
  user: string;
  date: string;
  notes: string;
  previousQuantity: number;
  newQuantity: number;
  createdAt: string;
}

export default function StockMovements() {
  const { language } = useLanguage();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "in" | "out">("all");

  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const data = await apiService.getStockMovements();
      console.log("Stock Movements Data:", data); // طباعة البيانات في الكونسول
      setMovements(data || []);
    } catch (error) {
      console.error("Error fetching movements:", error);
      showErrorToast(language === "ar" ? "خطأ في جلب حركات المخزون" : "Error fetching stock movements");
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter movements
  const filteredMovements = movements.filter(movement => {
    const matchesSearch = 
      movement.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === "all" || movement.operation === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Calculate statistics
  const totalIn = movements.filter(m => m.operation === "in").reduce((sum, m) => sum + m.quantity, 0);
  const totalOut = movements.filter(m => m.operation === "out").reduce((sum, m) => sum + m.quantity, 0);
  const netChange = totalIn - totalOut;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-primary"></div>
          <span className="ml-3 text-lg text-gray-600">
            {language === "ar" ? "جاري تحميل حركات المخزون..." : "Loading stock movements..."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex text-sm text-gray-500">
        <span>{language === "ar" ? "لوحة التحكم" : "Dashboard"}</span>
        <span className="mx-2">/</span>
        <span>{language === "ar" ? "المخزون" : "Inventory"}</span>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{language === "ar" ? "حركات المخزون" : "image.pngStock Movements"}</span>
      </nav>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === "ar" ? "حركات المخزون" : "Stock Movements"}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === "ar" ? "تتبع جميع حركات المخزون" : "Track all inventory movements"}
          </p>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border border-green-200 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 font-medium">
                {language === "ar" ? "إجمالي الإدخال" : "Total In"}
              </p>
              <p className="text-3xl font-bold text-green-600">
                {totalIn.toLocaleString()} {language === "ar" ? "متر" : "meters"}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-800 font-medium">
                {language === "ar" ? "إجمالي الإخراج" : "Total Out"}
              </p>
              <p className="text-3xl font-bold text-red-600">
                {totalOut.toLocaleString()} {language === "ar" ? "متر" : "meters"}
              </p>
            </div>
            <TrendingDown className="w-12 h-12 text-red-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`border rounded-lg p-6 ${netChange >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${netChange >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                {language === "ar" ? "صافي التغيير" : "Net Change"}
              </p>
              <p className={`text-3xl font-bold ${netChange >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {netChange >= 0 ? '+' : ''}{netChange.toLocaleString()} {language === "ar" ? "متر" : "meters"}
              </p>
            </div>
            <Package className={`w-12 h-12 ${netChange >= 0 ? 'text-blue-500' : 'text-orange-500'}`} />
          </div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div
            className={`flex items-center ${language === "ar" ? "space-x-reverse space-x-4" : "space-x-4"}`}
          >
            <div className="relative">
              <Search
                className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`}
              />
              <input
                type="text"
                placeholder={language === "ar" ? "البحث في الحركات..." : "Search movements..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${language === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent w-64`}
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as "all" | "in" | "out")}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
            >
              <option value="all">{language === "ar" ? "كل الحركات" : "All Movements"}</option>
              <option value="in">{language === "ar" ? "إدخال" : "In"}</option>
              <option value="out">{language === "ar" ? "إخراج" : "Out"}</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Movements Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "التاريخ" : "Date"}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "نوع القماش" : "Fabric Type"}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "اللون" : "Color"}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "العملية" : "Operation"}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "الكمية" : "Quantity"}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "المستخدم" : "User"}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "الملاحظات" : "Notes"}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMovements.map((movement, index) => (
                <motion.tr
                  key={movement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2 rtl:ml-2 rtl:mr-0" />
                      {new Date(movement.date).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {movement.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {movement.color}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        movement.operation === "in"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {movement.operation === "in" ? (
                        <>
                          <Plus className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
                          {language === "ar" ? "إدخال" : "In"}
                        </>
                      ) : (
                        <>
                          <Minus className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
                          {language === "ar" ? "إخراج" : "Out"}
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {movement.quantity.toLocaleString()} {language === "ar" ? "متر" : "meters"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2 rtl:ml-2 rtl:mr-0" />
                      {movement.user}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {movement.notes || "-"}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMovements.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {language === "ar" ? "لا توجد حركات" : "No movements found"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {language === "ar" ? "لم يتم العثور على حركات مخزون تطابق معايير البحث" : "No stock movements match your search criteria"}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
} 