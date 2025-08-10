# نظام العملات المتكامل - Currency System

## نظرة عامة / Overview

تم تطوير نظام عملات متكامل يدعم استخدام عملتين مختلفتين في النظام حسب نوع المعاملة:

An integrated currency system that supports using two different currencies based on transaction type:

## العملات المستخدمة / Currencies Used

### 🇺🇸 الدولار الأمريكي (USD)
- **الإيرادات** (Revenue)
- **الفواتير** (Invoices) 
- **العملاء** (Customers)
- **المبيعات** (Sales)
- **الأرباح** (Profits)

### 🇹🇷 الليرة التركية (TRY)
- **رواتب الموظفين** (Employee Salaries)
- **المصروفات التشغيلية** (Operational Expenses)
- **المدفوعات للعمال** (Worker Payments)

## أسعار الصرف / Exchange Rates

```typescript
USD_TRY: 34.50  // 1 USD = 34.50 TRY
TRY_USD: 0.029  // 1 TRY = 0.029 USD
```

## كيفية الاستخدام / Usage

### في الكود / In Code

```typescript
import { CurrencyConverter, CURRENCY_CONFIG } from '../utils/currency';

// تنسيق مبلغ بالدولار
const revenueDisplay = CurrencyConverter.formatAmount(1000, 'USD', language);
// Output: $1,000.00

// تنسيق مبلغ بالليرة التركية
const salaryDisplay = CurrencyConverter.formatAmount(34500, 'TRY', language);
// Output: ₺34,500.00

// تحويل عملة
const usdAmount = CurrencyConverter.tryToUsd(34500); // 1000 USD
const tryAmount = CurrencyConverter.usdToTry(1000);  // 34500 TRY
```

### في الواجهة / In UI

- **البطاقات المالية**: تظهر بالدولار مع تحويل تلقائي للمصروفات
- **صفحة الموظفين**: تظهر الرواتب بالليرة التركية
- **صفحة الفواتير**: تظهر بالدولار
- **لوحة التحكم**: تُحدد العملة حسب نوع البيانات

## الملفات المتأثرة / Affected Files

- `client/utils/currency.ts` - نظام العملات الأساسي
- `client/pages/FinancialDashboard.tsx` - اللوحة المالية
- `client/pages/Employees.tsx` - صفحة الموظفين
- `client/pages/Invoices.tsx` - صفحة الفواتير
- `client/pages/Customers.tsx` - صفحة العملاء
- `client/pages/Index.tsx` - الصفحة الرئيسية

## المميزات / Features

### ✅ التحويل التلقائي
- تحويل تلقائي بين العملات في الحسابات
- عرض موحد في التقارير المالية

### ✅ التنسيق المحلي
- دعم العربية والإنجليزية
- رموز العملات الصحيحة ($ و ₺)
- تنسيق الأرقام حسب اللغة

### ✅ المرونة
- سهولة تحديث أسعار الصرف
- إمكانية إضافة عملات جديدة
- نظام قابل للتوسع

## أمثلة من الواجهة / UI Examples

### البطاقات المالية:
- **الإيرادات**: $1,250.00
- **المصروفات**: $487.50 (محولة من ₺16,800)
- **الأرباح**: $762.50
- **هامش الربح**: 61.0%

### صفحة الموظفين:
- **إجمالي الرواتب**: ₺58,500.00
- **المدفوع**: ₺16,800.00  
- **المتبقي**: ₺41,700.00

## ملاحظات للمطورين / Developer Notes

- استخدم `CURRENCY_CONFIG` لتحديد العملة المناسبة لكل نوع بيانات
- استخدم `CurrencyConverter` للتحويل والتنسيق
- تأكد من تحديث أسعار الصرف دورياً
- اختبر التحويلات قبل النشر

## التحديثات المستقبلية / Future Updates

- [ ] ربط أسعار الصرف بـ API خارجي
- [ ] إضافة المزيد من العملات
- [ ] تاريخ أسعار الصرف
- [ ] إعدادات العملة للمستخدمين
