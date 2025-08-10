// نظام العملات المتكامل للمصنع
export interface CurrencyRates {
  USD_TRY: number; // دولار إلى ليرة تركية
  TRY_USD: number; // ليرة تركية إلى دولار
  lastUpdated: string;
}

// أسعار الصرف الحالية (يمكن ربطها بـ API لاحقاً)
export const CURRENCY_RATES: CurrencyRates = {
  USD_TRY: 34.50, // 1 دولار = 34.50 ليرة تركية (تقريبي)
  TRY_USD: 0.029, // 1 ليرة تركية = 0.029 دولار
  lastUpdated: new Date().toISOString(),
};

// تحويل العملات
export class CurrencyConverter {
  // تحويل من دولار إلى ليرة تركية
  static usdToTry(amount: number): number {
    return Math.round(amount * CURRENCY_RATES.USD_TRY * 100) / 100;
  }

  // تحويل من ليرة تركية إلى دولار
  static tryToUsd(amount: number): number {
    return Math.round(amount * CURRENCY_RATES.TRY_USD * 100) / 100;
  }

  // تنسيق العملة حسب النوع
  static formatCurrency(amount: number, currency: 'USD' | 'TRY', language: 'ar' | 'en' = 'ar'): string {
    const formatter = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formatter.format(amount);
  }

  // تنسيق للعرض مع الرمز المناسب
  static formatAmount(amount: number, currency: 'USD' | 'TRY', language: 'ar' | 'en' = 'ar'): string {
    const symbols = {
      USD: '$',
      TRY: '₺'
    };

    const formattedNumber = amount.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${symbols[currency]}${formattedNumber}`;
  }
}

// معرف نوع العملة للبيانات المختلفة
export const CURRENCY_CONFIG = {
  // العملاء والفواتير والمبيعات - بالدولار
  CUSTOMER_CURRENCY: 'USD' as const,
  INVOICE_CURRENCY: 'USD' as const,
  SALES_CURRENCY: 'USD' as const,
  
  // الموظفين والمرتبات - بالليرة التركية
  EMPLOYEE_CURRENCY: 'TRY' as const,
  SALARY_CURRENCY: 'TRY' as const,
  
  // المخزون (يمكن أن يكون مختلط)
  INVENTORY_CURRENCY: 'USD' as const,
} as const;

// دالة للحصول على العملة المناسبة حسب النوع
export function getCurrencyForType(type: keyof typeof CURRENCY_CONFIG): 'USD' | 'TRY' {
  return CURRENCY_CONFIG[type];
}

// دالة تحويل شاملة
export function convertAmount(
  amount: number, 
  fromCurrency: 'USD' | 'TRY', 
  toCurrency: 'USD' | 'TRY'
): number {
  if (fromCurrency === toCurrency) return amount;
  
  if (fromCurrency === 'USD' && toCurrency === 'TRY') {
    return CurrencyConverter.usdToTry(amount);
  }
  
  if (fromCurrency === 'TRY' && toCurrency === 'USD') {
    return CurrencyConverter.tryToUsd(amount);
  }
  
  return amount;
}

// دالة للحصول على رمز العملة
export function getCurrencySymbol(currency: 'USD' | 'TRY'): string {
  return currency === 'USD' ? '$' : '₺';
}
