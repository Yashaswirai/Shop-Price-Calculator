import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  IndianRupee,
  Scale,
  PlusCircle,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";
import { formatCurrency, formatWeight, getRateBreakdown } from "../utils/formatters";
import { getCategoryBadgeStyle } from "../utils/categories";

const Calculator = ({
  selectedProduct,
  onSelectProduct,
  productList = [],
  onAddToCart,
  playUiSound,
  onNotify,
  onOpenCatalog,
}) => {
  // Input states
  const [quantityGrams, setQuantityGrams] = useState(500);
  const [quantityInput, setQuantityInput] = useState("500");
  const [unit, setUnit] = useState("g"); // "g" or "kg"
  const [priceInput, setPriceInput] = useState("");
  const [copied, setCopied] = useState(false);
  const isTypingPriceRef = useRef(false);

  const pricePerKg = selectedProduct ? selectedProduct.price_per_kg : 0;
  const rates = getRateBreakdown(pricePerKg);

  // Synchronize price whenever product rate or quantity changes
  useEffect(() => {
    if (!pricePerKg || quantityGrams <= 0) return;
    if (isTypingPriceRef.current) {
      isTypingPriceRef.current = false;
      return;
    }
    const p = Math.ceil((pricePerKg / 1000) * quantityGrams);
    setPriceInput(p > 0 ? String(p) : "");
  }, [pricePerKg, quantityGrams]);

  // Handle quantity text change -> calculate ceiling price
  const handleQuantityChange = (val) => {
    isTypingPriceRef.current = false;
    setQuantityInput(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      const g = unit === "kg" ? num * 1000 : num;
      setQuantityGrams(g);
      if (pricePerKg > 0) {
        const p = Math.ceil((pricePerKg / 1000) * g);
        setPriceInput(p > 0 ? String(p) : "");
      }
    } else {
      setQuantityGrams(0);
      setPriceInput("");
    }
  };

  // Handle price text change -> calculate grams without overriding price input
  const handlePriceChange = (val) => {
    isTypingPriceRef.current = true;
    setPriceInput(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0 && pricePerKg > 0) {
      // Calculate weight for the entered price
      const g = Math.round((1000 / pricePerKg) * num);
      setQuantityGrams(g);
      setQuantityInput(unit === "kg" ? (g / 1000).toString() : String(g));
    } else {
      setQuantityGrams(0);
      setQuantityInput("");
    }
  };

  // Unit switch
  const handleUnitToggle = (newUnit) => {
    if (newUnit === unit) return;
    playUiSound?.("click");
    setUnit(newUnit);
    if (newUnit === "kg") {
      setQuantityInput((quantityGrams / 1000).toString());
    } else {
      setQuantityInput(String(quantityGrams));
    }
  };

  // Quick weight preset
  const applyWeightPreset = (grams) => {
    playUiSound?.("click");
    setQuantityGrams(grams);
    if (unit === "kg") {
      setQuantityInput((grams / 1000).toString());
    } else {
      setQuantityInput(String(grams));
    }
    if (pricePerKg > 0) {
      const p = Math.ceil((pricePerKg / 1000) * grams);
      setPriceInput(String(p));
    }
  };

  // Quick price preset
  const applyPricePreset = (rupees) => {
    playUiSound?.("click");
    setPriceInput(String(rupees));
    if (pricePerKg > 0) {
      const g = Math.round((1000 / pricePerKg) * rupees);
      setQuantityGrams(g);
      setQuantityInput(unit === "kg" ? (g / 1000).toString() : String(g));
    }
  };

  // Slider change
  const handleSliderChange = (e) => {
    const g = Number(e.target.value);
    setQuantityGrams(g);
    setQuantityInput(unit === "kg" ? (g / 1000).toFixed(2) : String(g));
    if (pricePerKg > 0) {
      const p = Math.ceil((pricePerKg / 1000) * g);
      setPriceInput(String(p));
    }
  };

  // Add current calculation to shopping bill
  const handleAddToCart = () => {
    if (!selectedProduct) {
      onNotify?.("Please choose a product first!", "error");
      playUiSound?.("delete");
      return;
    }

    const finalPrice = Math.ceil(Number(priceInput)) || 0;
    if (finalPrice <= 0 || quantityGrams <= 0) {
      onNotify?.("Please specify a valid quantity or price.", "error");
      playUiSound?.("delete");
      return;
    }

    playUiSound?.("cart");
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.8 },
    });

    onAddToCart({
      id: `${selectedProduct.product}-${Date.now()}`,
      product: selectedProduct.product,
      price_per_kg: selectedProduct.price_per_kg,
      category: selectedProduct.category,
      quantityGrams,
      totalPrice: finalPrice,
    });

    onNotify?.(`Added ${formatWeight(quantityGrams)} ${selectedProduct.product} to Bill!`, "success");
  };

  // Total price rounded up to whole rupee
  const calculatedTotal = Math.ceil(Number(priceInput)) || 0;

  // Copy calculation result
  const handleCopyResult = () => {
    if (!selectedProduct) return;
    playUiSound?.("click");
    const text = `${formatWeight(quantityGrams)} of ${selectedProduct.product} = ${formatCurrency(calculatedTotal)}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      onNotify?.("Calculation copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Clear inputs
  const handleClear = () => {
    playUiSound?.("reset");
    setQuantityGrams(0);
    setQuantityInput("");
    setPriceInput("");
  };

  return (
    <div className="space-y-6">
      {/* Product Selection Bar */}
      <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700/80 shadow-sm backdrop-blur-md transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
              {selectedProduct ? selectedProduct.product.charAt(0).toUpperCase() : "?"}
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Active Product
              </span>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">
                {selectedProduct ? selectedProduct.product : "No Product Selected"}
              </h3>
              {selectedProduct && (
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryBadgeStyle(
                      selectedProduct.category
                    )}`}
                  >
                    {selectedProduct.category || "General"}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{selectedProduct.price_per_kg}/kg
                  </span>
                  <span className="text-[11px] text-gray-400">
                    (₹{rates.per100g}/100g)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Dropdown / Switch button */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedProduct ? selectedProduct.product : ""}
              onChange={(e) => {
                const found = productList.find((p) => p.product === e.target.value);
                if (found) {
                  playUiSound?.("select");
                  onSelectProduct(found);
                }
              }}
              className="px-3 py-2 rounded-xl text-xs md:text-sm font-semibold border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer max-w-[200px]"
            >
              <option value="" disabled>
                Select product...
              </option>
              {productList.map((item, idx) => (
                <option key={idx} value={item.product}>
                  {item.product} (₹{item.price_per_kg}/kg)
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                playUiSound?.("click");
                onOpenCatalog?.();
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 transition-all cursor-pointer"
            >
              Browse
            </button>
          </div>
        </div>
      </div>

      {/* Calculator Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Dual Inputs and Presets (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700/80 shadow-sm space-y-5">
            {/* Quantity Input with unit toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-500" />
                  Quantity ({unit === "g" ? "Grams" : "Kilograms"})
                </label>
                {/* Unit Switch */}
                <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => handleUnitToggle("g")}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      unit === "g"
                        ? "bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    Grams (g)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnitToggle("kg")}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      unit === "kg"
                        ? "bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    Kg
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={quantityInput}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  placeholder={`Enter quantity in ${unit}`}
                  className="w-full pl-4 pr-16 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-gray-400 select-none uppercase">
                  {unit}
                </span>
              </div>

              {/* Slider for smooth visual adjustment */}
              <div className="mt-3">
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={quantityGrams}
                  onChange={handleSliderChange}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 select-none">
                  <span>0g</span>
                  <span>500g</span>
                  <span>1kg</span>
                  <span>2kg</span>
                  <span>5kg</span>
                </div>
              </div>

              {/* Quick Weight Presets */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {[
                  { label: "50g", g: 50 },
                  { label: "100g", g: 100 },
                  { label: "250g (Paav)", g: 250 },
                  { label: "500g (1/2kg)", g: 500 },
                  { label: "1 kg", g: 1000 },
                  { label: "2 kg", g: 2000 },
                  { label: "5 kg", g: 5000 },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => applyWeightPreset(chip.g)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      quantityGrams === chip.g
                        ? "bg-emerald-500 text-white border-emerald-600 shadow-xs"
                        : "bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-emerald-500/50"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Input with Rupee symbol */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mb-2">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                Price (₹) - Or enter budget amount
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={priceInput}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="Enter budget to calculate grams"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              {/* Quick Price Presets */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {[10, 20, 50, 100, 200, 500].map((rupees) => (
                  <button
                    key={rupees}
                    type="button"
                    onClick={() => applyPricePreset(rupees)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:border-emerald-500/50 transition-all cursor-pointer"
                  >
                    ₹{rupees}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg text-gray-500 hover:text-rose-500 transition-colors ml-auto cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculation Result & Bill Action (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl shadow-emerald-700/25 relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                Calculation Result
              </span>
              <button
                onClick={handleCopyResult}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer"
                title="Copy result"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-200" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {/* Total Price Amount (Rounded up to whole rupee) */}
            <div className="my-2">
              <div className="text-4xl md:text-5xl font-extrabold tracking-tight">
                {formatCurrency(calculatedTotal)}
              </div>
              <p className="text-emerald-100 text-xs mt-1">
                For {formatWeight(quantityGrams)} of {selectedProduct?.product || "item"}
              </p>
            </div>

            {/* Breakdown table (Whole rupee ceiling values) */}
            <div className="mt-5 pt-4 border-t border-white/20 space-y-2 text-xs">
              <div className="flex justify-between text-emerald-100">
                <span>Product Rate:</span>
                <span className="font-bold text-white">₹{pricePerKg} / kg</span>
              </div>
              <div className="flex justify-between text-emerald-100">
                <span>100 grams:</span>
                <span className="font-bold text-white">₹{rates.per100g}</span>
              </div>
              <div className="flex justify-between text-emerald-100">
                <span>250 grams (Paav):</span>
                <span className="font-bold text-white">₹{rates.per250g}</span>
              </div>
              <div className="flex justify-between text-emerald-100">
                <span>500 grams (1/2 kg):</span>
                <span className="font-bold text-white">₹{rates.per500g}</span>
              </div>
            </div>

            {/* Add to Bill Button */}
            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={!selectedProduct || calculatedTotal <= 0}
                className="w-full py-3.5 px-4 rounded-xl bg-white text-emerald-800 font-bold text-sm shadow-lg hover:bg-emerald-50 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusCircle className="w-4 h-4 text-emerald-700" />
                Add to Shopping Bill
              </motion.button>
            </div>
          </motion.div>

          {/* Quick Tips */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 text-xs text-gray-500 dark:text-gray-400">
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
              💡 Smart Rounding Tip:
            </p>
            <p>
              All item prices round up to the next whole rupee (ceiling) with no decimals, ensuring convenient shop calculations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
