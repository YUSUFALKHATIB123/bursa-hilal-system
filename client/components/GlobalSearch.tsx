import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Package,
  Users,
  FileText,
  ShoppingCart,
  UserCheck,
  Building2,
} from "lucide-react";
import systemData from "../data/systemData";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  path: string;
  icon: React.ElementType;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  // Handle ESC key and body effects
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      document.body.classList.add('search-open');
    } else {
      document.body.classList.remove('search-open');
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      document.body.classList.remove('search-open');
    };
  }, [isOpen, onClose]);

  // Search function
  const searchInData = (query: string): SearchResult[] => {
    if (!query.trim()) return [];

    const searchResults: SearchResult[] = [];
    const lowercaseQuery = query.toLowerCase();

    // Search in Orders
    if (Array.isArray(systemData.orders)) {
      systemData.orders.forEach((order) => {
        if (
          order.customer?.toLowerCase().includes(lowercaseQuery) ||
          order.id?.toLowerCase().includes(lowercaseQuery)
        ) {
          searchResults.push({
            id: order.id,
            title: `${language === "ar" ? "طلب" : "Order"} ${order.id}`,
            subtitle: `${order.customer} - $${order.total?.toLocaleString()}`,
            type: language === "ar" ? "طلبات" : "Orders",
            path: `/orders`,
            icon: ShoppingCart,
          });
        }
      });
    }

    // Search in Customers
    if (Array.isArray(systemData.customers)) {
      systemData.customers.forEach((customer) => {
        if (
          customer.name?.toLowerCase().includes(lowercaseQuery) ||
          customer.email?.toLowerCase().includes(lowercaseQuery)
        ) {
          searchResults.push({
            id: customer.id,
            title: customer.name,
            subtitle: `${customer.phone} - ${customer.email}`,
            type: language === "ar" ? "عملاء" : "Customers",
            path: `/customers`,
            icon: Users,
          });
        }
      });
    }

    // Search in Inventory
    if (Array.isArray(systemData.inventory)) {
      systemData.inventory.forEach((item) => {
        if (
          item.type?.toLowerCase().includes(lowercaseQuery) ||
          item.color?.toLowerCase().includes(lowercaseQuery)
        ) {
          searchResults.push({
            id: item.id,
            title: item.type,
            subtitle: `${language === "ar" ? "المخزون:" : "Stock:"} ${item.quantity} ${item.unit}`,
            type: language === "ar" ? "مخزون" : "Inventory",
            path: `/inventory`,
            icon: Package,
          });
        }
      });
    }

    return searchResults.slice(0, 8);
  };

  // Update results when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const searchResults = searchInData(searchQuery);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [searchQuery, language]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.path);
    onClose();
    setSearchQuery("");
    setResults([]);
  };

  const handleClose = () => {
    onClose();
    setSearchQuery("");
    setResults([]);
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div 
        className="search-container fixed inset-0 z-[9999] flex items-start justify-center pt-20 px-4"
        onClick={handleClose}
      >
        {/* Search Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
            {/* Search Header */}
            <div className="p-4 border-b border-gray-100">
              <div className={`flex items-center gap-3 ${language === "ar" ? "flex-row-reverse" : ""}`}>
                <Search className="w-5 h-5 text-green-600" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    language === "ar"
                      ? "ابحث في جميع الأقسام..."
                      : "Search across all sections..."
                  }
                  className={`flex-1 text-lg outline-none bg-transparent placeholder-gray-400 ${language === "ar" ? "text-right" : "text-left"}`}
                  autoFocus
                  dir={language === "ar" ? "rtl" : "ltr"}
                />
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {results.length > 0 ? (
                <div>
                  {results.map((result, index) => (
                    <motion.div
                      key={`${result.type}-${result.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleResultClick(result)}
                      className={`flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 ${language === "ar" ? "flex-row-reverse space-x-reverse space-x-3" : "space-x-3"}`}
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <result.icon className="w-4 h-4 text-green-600" />
                      </div>
                      <div className={`flex-1 ${language === "ar" ? "text-right" : "text-left"}`}>
                        <div className={`flex items-center justify-between ${language === "ar" ? "flex-row-reverse" : ""}`}>
                          <h3 className="font-medium text-gray-900 text-sm">
                            {result.title}
                          </h3>
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            {result.type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{result.subtitle}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">
                    {language === "ar"
                      ? "لم يتم العثور على نتائج"
                      : "No results found"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {language === "ar"
                      ? "جرب كلمات مختلفة"
                      : "Try different keywords"}
                  </p>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-gray-700 font-medium mb-1">
                    {language === "ar"
                      ? "ابدأ بكتابة للبحث"
                      : "Start typing to search"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {language === "ar"
                      ? "ابحث في الطلبات، العملاء، المخزون والمزيد"
                      : "Search in orders, customers, inventory and more"}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {!searchQuery.trim() && (
              <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-gray-600 font-mono">ESC</kbd>
                  <span>{language === "ar" ? "للإغلاق" : "to close"}</span>
                </div>
              </div>
            )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default GlobalSearch;
