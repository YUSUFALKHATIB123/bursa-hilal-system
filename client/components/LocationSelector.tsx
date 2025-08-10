import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Globe, Flag } from "lucide-react";
import { countries, Country, Province, formatLocation } from "../data/locations";
import { useLanguage } from "../contexts/LanguageContext";

interface LocationSelectorProps {
  onLocationChange: (location: {
    country: string;
    province: string;
    formattedAddress: string;
  }) => void;
  initialCountry?: string;
  initialProvince?: string;
  className?: string;
}

export default function LocationSelector({
  onLocationChange,
  initialCountry = "",
  initialProvince = "",
  className = "",
}: LocationSelectorProps) {
  const { language } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState<string>(initialCountry);
  const [selectedProvince, setSelectedProvince] = useState<string>(initialProvince);
  const [availableProvinces, setAvailableProvinces] = useState<Province[]>([]);

  // تحديث المحافظات المتاحة عند تغيير البلد
  useEffect(() => {
    if (selectedCountry) {
      const country = countries.find(c => c.id === selectedCountry);
      if (country) {
        setAvailableProvinces(country.provinces);
        // إذا كانت المحافظة المختارة لا تنتمي للبلد الجديد، أعد تعيينها
        if (selectedProvince && !country.provinces.find(p => p.id === selectedProvince)) {
          setSelectedProvince("");
        }
      }
    } else {
      setAvailableProvinces([]);
      setSelectedProvince("");
    }
  }, [selectedCountry]);

  // إرسال التحديث للمكون الأب عند تغيير المحافظة أو البلد
  useEffect(() => {
    if (selectedCountry && selectedProvince) {
      const formattedAddress = formatLocation(selectedCountry, selectedProvince, language);
      onLocationChange({
        country: selectedCountry,
        province: selectedProvince,
        formattedAddress: formattedAddress,
      });
    }
  }, [selectedCountry, selectedProvince, language, onLocationChange]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryId = e.target.value;
    setSelectedCountry(countryId);
    setSelectedProvince(""); // إعادة تعيين المحافظة
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvince(e.target.value);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* عنوان القسم */}
      <div className="flex items-center space-x-2 text-gray-700 mb-3">
        <MapPin className="w-5 h-5 text-blue-500" />
        <h3 className="text-sm font-medium">
          {language === "ar" ? "اختيار الموقع" : "Location Selection"}
        </h3>
      </div>

      {/* اختيار البلد */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-green-500" />
            <span>
              {language === "ar" ? "البلد *" : "Country *"}
            </span>
          </div>
        </label>
        <motion.select
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          value={selectedCountry}
          onChange={handleCountryChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
          required
        >
          <option value="">
            {language === "ar" ? "-- اختر البلد --" : "-- Select Country --"}
          </option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {language === "ar" ? country.name : country.nameEn} {country.phoneCode}
            </option>
          ))}
        </motion.select>
      </div>

      {/* اختيار المحافظة/المدينة */}
      {selectedCountry && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center space-x-2">
              <Flag className="w-4 h-4 text-blue-500" />
              <span>
                {language === "ar" ? "المحافظة/المدينة *" : "Province/City *"}
              </span>
            </div>
          </label>
          <motion.select
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            value={selectedProvince}
            onChange={handleProvinceChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
            required
          >
            <option value="">
              {language === "ar" 
                ? "-- اختر المحافظة/المدينة --" 
                : "-- Select Province/City --"
              }
            </option>
            {availableProvinces.map((province) => (
              <option key={province.id} value={province.id}>
                {language === "ar" ? province.name : province.nameEn}
              </option>
            ))}
          </motion.select>
        </motion.div>
      )}

      {/* عرض الموقع المحدد */}
      {selectedCountry && selectedProvince && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center space-x-2 text-green-700">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">
              {language === "ar" ? "الموقع المحدد:" : "Selected Location:"}
            </span>
          </div>
          <p className="text-green-800 font-semibold mt-1">
            {formatLocation(selectedCountry, selectedProvince, language)}
          </p>
        </motion.div>
      )}

      {/* رسالة مساعدة */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <p>
          {language === "ar" 
            ? "💡 اختر البلد أولاً، ثم ستظهر قائمة المحافظات والمدن المتاحة لهذا البلد."
            : "💡 Select the country first, then the available provinces/cities for that country will appear."
          }
        </p>
      </div>
    </div>
  );
}
