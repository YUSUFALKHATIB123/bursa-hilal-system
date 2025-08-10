// قاعدة بيانات البلدان والمحافظات/المدن
export interface Province {
  id: string;
  name: string;
  nameEn: string;
}

export interface Country {
  id: string;
  name: string;
  nameEn: string;
  code: string;
  phoneCode: string;
  provinces: Province[];
}

export const countries: Country[] = [
  {
    id: "libya",
    name: "ليبيا",
    nameEn: "Libya",
    code: "LY",
    phoneCode: "+218",
    provinces: [
      { id: "tripoli", name: "طرابلس", nameEn: "Tripoli" },
      { id: "benghazi", name: "بنغازي", nameEn: "Benghazi" },
      { id: "misrata", name: "مصراتة", nameEn: "Misrata" },
      { id: "zawiya", name: "الزاوية", nameEn: "Zawiya" },
      { id: "bayda", name: "البيضاء", nameEn: "Al Bayda" },
      { id: "tobruk", name: "طبرق", nameEn: "Tobruk" },
      { id: "derna", name: "درنة", nameEn: "Derna" },
      { id: "sebha", name: "سبها", nameEn: "Sabha" },
      { id: "sirte", name: "سرت", nameEn: "Sirte" },
      { id: "ajdabiya", name: "اجدابيا", nameEn: "Ajdabiya" }
    ]
  },
  {
    id: "egypt",
    name: "مصر",
    nameEn: "Egypt",
    code: "EG",
    phoneCode: "+20",
    provinces: [
      { id: "cairo", name: "القاهرة", nameEn: "Cairo" },
      { id: "alexandria", name: "الإسكندرية", nameEn: "Alexandria" },
      { id: "giza", name: "الجيزة", nameEn: "Giza" },
      { id: "luxor", name: "الأقصر", nameEn: "Luxor" },
      { id: "aswan", name: "أسوان", nameEn: "Aswan" },
      { id: "port-said", name: "بورسعيد", nameEn: "Port Said" },
      { id: "suez", name: "السويس", nameEn: "Suez" },
      { id: "mansoura", name: "المنصورة", nameEn: "Mansoura" },
      { id: "tanta", name: "طنطا", nameEn: "Tanta" },
      { id: "ismailia", name: "الإسماعيلية", nameEn: "Ismailia" }
    ]
  },
  {
    id: "syria",
    name: "سوريا",
    nameEn: "Syria",
    code: "SY",
    phoneCode: "+963",
    provinces: [
      { id: "damascus", name: "دمشق", nameEn: "Damascus" },
      { id: "aleppo", name: "حلب", nameEn: "Aleppo" },
      { id: "homs", name: "حمص", nameEn: "Homs" },
      { id: "hama", name: "حماة", nameEn: "Hama" },
      { id: "lattakia", name: "اللاذقية", nameEn: "Latakia" },
      { id: "tartus", name: "طرطوس", nameEn: "Tartus" },
      { id: "daraa", name: "درعا", nameEn: "Daraa" },
      { id: "deir-ez-zor", name: "دير الزور", nameEn: "Deir ez-Zor" },
      { id: "hasaka", name: "الحسكة", nameEn: "Al-Hasakah" },
      { id: "idlib", name: "إدلب", nameEn: "Idlib" }
    ]
  },
  {
    id: "turkey",
    name: "تركيا",
    nameEn: "Turkey",
    code: "TR",
    phoneCode: "+90",
    provinces: [
      { id: "istanbul", name: "إسطنبول", nameEn: "Istanbul" },
      { id: "ankara", name: "أنقرة", nameEn: "Ankara" },
      { id: "izmir", name: "إزمير", nameEn: "Izmir" },
      { id: "bursa", name: "بورصة", nameEn: "Bursa" },
      { id: "antalya", name: "أنطاليا", nameEn: "Antalya" },
      { id: "adana", name: "أضنة", nameEn: "Adana" },
      { id: "konya", name: "قونيا", nameEn: "Konya" },
      { id: "gaziantep", name: "غازي عنتاب", nameEn: "Gaziantep" },
      { id: "mersin", name: "مرسين", nameEn: "Mersin" },
      { id: "kayseri", name: "قيصري", nameEn: "Kayseri" }
    ]
  },
  {
    id: "jordan",
    name: "الأردن",
    nameEn: "Jordan",
    code: "JO",
    phoneCode: "+962",
    provinces: [
      { id: "amman", name: "عمان", nameEn: "Amman" },
      { id: "irbid", name: "إربد", nameEn: "Irbid" },
      { id: "zarqa", name: "الزرقاء", nameEn: "Zarqa" },
      { id: "aqaba", name: "العقبة", nameEn: "Aqaba" },
      { id: "salt", name: "السلط", nameEn: "Salt" },
      { id: "madaba", name: "مادبا", nameEn: "Madaba" },
      { id: "karak", name: "الكرك", nameEn: "Karak" },
      { id: "tafilah", name: "الطفيلة", nameEn: "Tafilah" },
      { id: "maan", name: "معان", nameEn: "Ma'an" },
      { id: "ajloun", name: "عجلون", nameEn: "Ajloun" }
    ]
  },
  {
    id: "lebanon",
    name: "لبنان",
    nameEn: "Lebanon",
    code: "LB",
    phoneCode: "+961",
    provinces: [
      { id: "beirut", name: "بيروت", nameEn: "Beirut" },
      { id: "mount-lebanon", name: "جبل لبنان", nameEn: "Mount Lebanon" },
      { id: "north-lebanon", name: "لبنان الشمالي", nameEn: "North Lebanon" },
      { id: "south-lebanon", name: "لبنان الجنوبي", nameEn: "South Lebanon" },
      { id: "bekaa", name: "البقاع", nameEn: "Bekaa" },
      { id: "nabatieh", name: "النبطية", nameEn: "Nabatieh" },
      { id: "baalbek-hermel", name: "بعلبك الهرمل", nameEn: "Baalbek-Hermel" },
      { id: "akkar", name: "عكار", nameEn: "Akkar" }
    ]
  },
  {
    id: "palestine",
    name: "فلسطين",
    nameEn: "Palestine",
    code: "PS",
    phoneCode: "+970",
    provinces: [
      { id: "jerusalem", name: "القدس", nameEn: "Jerusalem" },
      { id: "gaza", name: "غزة", nameEn: "Gaza" },
      { id: "west-bank", name: "الضفة الغربية", nameEn: "West Bank" },
      { id: "ramallah", name: "رام الله", nameEn: "Ramallah" },
      { id: "nablus", name: "نابلس", nameEn: "Nablus" },
      { id: "hebron", name: "الخليل", nameEn: "Hebron" },
      { id: "bethlehem", name: "بيت لحم", nameEn: "Bethlehem" },
      { id: "jenin", name: "جنين", nameEn: "Jenin" },
      { id: "tulkarm", name: "طولكرم", nameEn: "Tulkarm" },
      { id: "qalqilya", name: "قلقيلية", nameEn: "Qalqilya" }
    ]
  },
  {
    id: "iraq",
    name: "العراق",
    nameEn: "Iraq",
    code: "IQ",
    phoneCode: "+964",
    provinces: [
      { id: "baghdad", name: "بغداد", nameEn: "Baghdad" },
      { id: "basra", name: "البصرة", nameEn: "Basra" },
      { id: "mosul", name: "الموصل", nameEn: "Mosul" },
      { id: "erbil", name: "أربيل", nameEn: "Erbil" },
      { id: "najaf", name: "النجف", nameEn: "Najaf" },
      { id: "karbala", name: "كربلاء", nameEn: "Karbala" },
      { id: "hillah", name: "الحلة", nameEn: "Hillah" },
      { id: "kirkuk", name: "كركوك", nameEn: "Kirkuk" },
      { id: "sulaymaniyah", name: "السليمانية", nameEn: "Sulaymaniyah" },
      { id: "dohuk", name: "دهوك", nameEn: "Dohuk" }
    ]
  },
  {
    id: "saudi",
    name: "المملكة العربية السعودية",
    nameEn: "Saudi Arabia",
    code: "SA",
    phoneCode: "+966",
    provinces: [
      { id: "riyadh", name: "الرياض", nameEn: "Riyadh" },
      { id: "jeddah", name: "جدة", nameEn: "Jeddah" },
      { id: "mecca", name: "مكة المكرمة", nameEn: "Mecca" },
      { id: "medina", name: "المدينة المنورة", nameEn: "Medina" },
      { id: "dammam", name: "الدمام", nameEn: "Dammam" },
      { id: "khobar", name: "الخبر", nameEn: "Khobar" },
      { id: "taif", name: "الطائف", nameEn: "Taif" },
      { id: "tabuk", name: "تبوك", nameEn: "Tabuk" },
      { id: "abha", name: "أبها", nameEn: "Abha" },
      { id: "najran", name: "نجران", nameEn: "Najran" }
    ]
  },
  {
    id: "uae",
    name: "الإمارات العربية المتحدة",
    nameEn: "United Arab Emirates",
    code: "AE",
    phoneCode: "+971",
    provinces: [
      { id: "dubai", name: "دبي", nameEn: "Dubai" },
      { id: "abu-dhabi", name: "أبو ظبي", nameEn: "Abu Dhabi" },
      { id: "sharjah", name: "الشارقة", nameEn: "Sharjah" },
      { id: "ajman", name: "عجمان", nameEn: "Ajman" },
      { id: "ras-al-khaimah", name: "رأس الخيمة", nameEn: "Ras Al Khaimah" },
      { id: "fujairah", name: "الفجيرة", nameEn: "Fujairah" },
      { id: "umm-al-quwain", name: "أم القيوين", nameEn: "Umm Al Quwain" }
    ]
  }
];

// دالة للبحث عن بلد حسب المعرف
export const getCountryById = (id: string): Country | undefined => {
  return countries.find(country => country.id === id);
};

// دالة للبحث عن محافظة حسب المعرف والبلد
export const getProvinceById = (countryId: string, provinceId: string): Province | undefined => {
  const country = getCountryById(countryId);
  return country?.provinces.find(province => province.id === provinceId);
};

// دالة لتنسيق الموقع الكامل
export const formatLocation = (countryId: string, provinceId: string, language: 'ar' | 'en' = 'ar'): string => {
  const country = getCountryById(countryId);
  const province = getProvinceById(countryId, provinceId);
  
  if (!country || !province) return '';
  
  if (language === 'ar') {
    return `${province.name}, ${country.name}`;
  } else {
    return `${province.nameEn}, ${country.nameEn}`;
  }
};
