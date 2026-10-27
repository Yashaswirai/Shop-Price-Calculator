/**
 * Format a number as Indian Rupee (₹), always rounded up to next whole rupee (ceiling)
 * Never displays decimal values (e.g. 4.2 or 4.6 displays as ₹5).
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  const num = Math.ceil(Number(amount));
  return `₹${num.toLocaleString("en-IN")}`;
};

/**
 * Format weight in grams or kilograms
 */
export const formatWeight = (grams) => {
  if (grams === undefined || grams === null || isNaN(grams)) return "0 g";
  const g = Number(grams);
  if (g >= 1000) {
    const kg = g / 1000;
    return `${Number.isInteger(kg) ? kg : kg.toFixed(2)} kg (${g} g)`;
  }
  return `${g} g`;
};

/**
 * Calculate price from weight (in grams) and price per kg, rounded up to next whole rupee
 */
export const calculatePriceFromGrams = (pricePerKg, grams) => {
  if (!pricePerKg || !grams || pricePerKg <= 0 || grams <= 0) return 0;
  const rawPrice = (pricePerKg / 1000) * grams;
  return Math.ceil(rawPrice);
};

/**
 * Calculate weight (in grams) from price and price per kg
 */
export const calculateGramsFromPrice = (pricePerKg, price) => {
  if (!pricePerKg || !price || pricePerKg <= 0 || price <= 0) return 0;
  const rawGrams = (1000 / pricePerKg) * price;
  return Math.round(rawGrams);
};

/**
 * Get rate breakdowns for a given price per kg (all rounded up to whole rupee)
 */
export const getRateBreakdown = (pricePerKg) => {
  const p = Number(pricePerKg) || 0;
  return {
    per1000g: Math.ceil(p),
    per500g: Math.ceil(p / 2),
    per250g: Math.ceil(p / 4),
    per100g: Math.ceil(p / 10),
    per50g: Math.ceil(p / 20),
  };
};
