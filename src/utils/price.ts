// utils/price.ts

/**
 * فرمت قیمت برای نمایش
 * مثال:
 * 1500000 => "۱٬۵۰۰٬۰۰۰"
 */
export const formatPrice = (value: number | string): string => {
  if (!value) return "۰";

  return Number(value).toLocaleString();
};

/**
 * فرمت قیمت برای Input
 * مثال:
 * "1500000" => "۱٬۵۰۰٬۰۰۰"
 */
export const formatPriceInput = (
  value: number | string
): string => {
  if (!value) return "";

  const numericValue = String(value).replace(/\D/g, "");

  return Number(numericValue).toLocaleString();
};

/**
 * حذف جداکننده‌ها و تبدیل به مقدار خام
 * مثال:
 * "۱٬۵۰۰٬۰۰۰" => "1500000"
 * "1,500,000" => "1500000"
 */
export const parsePriceInput = (value: string): string => {
  const englishNumbers = value.replace(/[۰-۹]/g, (d) =>
    "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString()
  );

  return englishNumbers.replace(/\D/g, "");
};

/**
 * تبدیل تومان به ریال
 * مثال:
 * 15000 => 150000
 */
export const tomanToRial = (
  value: number | string
): number => {
  return Number(value || 0) * 10;
};

/**
 * تبدیل ریال به تومان (حذف سه صفر)
 * مثال:
 * 150000 => 150
 */
export const removeThreeZeros = (
  value: number | string
): number => {
  return Math.floor(Number(value || 0) / 1000);
};

export const formatRial = (value: number | string): string => {
  const num = Number(value || 0);
  return num.toLocaleString("fa-IR");
};