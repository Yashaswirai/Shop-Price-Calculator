import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, IndianRupee, Sparkles, ArrowRightLeft } from "lucide-react";
import { formatCurrency } from "../utils/formatters";

const UnitConverter = ({ playUiSound }) => {
  const [basePrice, setBasePrice] = useState("120");
  const [weightValue, setWeightValue] = useState("1");
  const [sourceUnit, setSourceUnit] = useState("kg");

  const numPrice = Number(basePrice) || 0;
  const numWeight = Number(weightValue) || 0;

  // Conversion rates to grams
  const unitToGrams = {
    g: 1,
    kg: 1000,
    quintal: 100000,
    lb: 453.592,
    oz: 28.3495,
  };

  const grams = numWeight * (unitToGrams[sourceUnit] || 1);

  // Common Indian grocery portions
  const portions = [
    { label: "50 grams", grams: 50, desc: "Small pinch / Spices" },
    { label: "100 grams", grams: 100, desc: "Standard 100g pack" },
    { label: "200 grams", grams: 200, desc: "200g portion" },
    { label: "250 grams (1 Paav)", grams: 250, desc: "1/4 kilogram" },
    { label: "500 grams (Aadha Kilo)", grams: 500, desc: "Half kilogram" },
    { label: "750 grams (Pauva)", grams: 750, desc: "3/4 kilogram" },
    { label: "1 Kilogram", grams: 1000, desc: "1 kg standard" },
    { label: "1.25 Kilogram (Sava Kilo)", grams: 1250, desc: "1 kg + 250g" },
    { label: "1.5 Kilogram (Dedh Kilo)", grams: 1500, desc: "1.5 kg" },
    { label: "2 Kilograms", grams: 2000, desc: "2 kg standard" },
    { label: "2.5 Kilograms (Dhaai Kilo)", grams: 2500, desc: "2.5 kg" },
    { label: "5 Kilograms", grams: 5000, desc: "5 kg bag" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center max-w-xl mx-auto">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
          <Scale className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Grocery Rate & Weight Converter
        </h2>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Quickly calculate customary Indian grocery weights (Paav, Aadha Kilo, Sava Kilo) and convert between units.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Customary Portion Rate Table */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 md:p-6 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              Instant Portion Table
            </h3>
          </div>

          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1.5">
            Enter Price Per Kilogram (₹ / kg)
          </label>
          <div className="relative mb-5">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 font-bold">
              ₹
            </span>
            <input
              type="number"
              min="0"
              value={basePrice}
              onChange={(e) => {
                setBasePrice(e.target.value);
                playUiSound?.("click");
              }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 120"
            />
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {portions.map((p, idx) => {
              const portionCost = numPrice > 0 ? Math.ceil((numPrice / 1000) * p.grams) : 0;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-gray-200/60 dark:border-gray-700/60 transition-colors"
                >
                  <div>
                    <span className="font-semibold text-xs md:text-sm text-gray-900 dark:text-white block">
                      {p.label}
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      {p.desc}
                    </span>
                  </div>
                  <span className="font-bold text-sm md:text-base text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(portionCost)}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Card 2: Multi-Unit Weight Converter */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 md:p-6 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ArrowRightLeft className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Multi-Unit Weight Converter
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1.5">
                  Amount
                </label>
                <input
                  type="number"
                  min="0"
                  value={weightValue}
                  onChange={(e) => {
                    setWeightValue(e.target.value);
                    playUiSound?.("click");
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1.5">
                  Unit
                </label>
                <select
                  value={sourceUnit}
                  onChange={(e) => {
                    setSourceUnit(e.target.value);
                    playUiSound?.("click");
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold text-base focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="quintal">Quintal (100 kg)</option>
                  <option value="lb">Pounds (lbs)</option>
                  <option value="oz">Ounces (oz)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Equivalent In Other Units
              </h4>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Grams (g)</span>
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  {grams.toLocaleString("en-IN", { maximumFractionDigits: 2 })} g
                </span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Kilograms (kg)</span>
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  {(grams / 1000).toLocaleString("en-IN", { maximumFractionDigits: 3 })} kg
                </span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Quintal (q)</span>
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  {(grams / 100000).toLocaleString("en-IN", { maximumFractionDigits: 4 })} q
                </span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Pounds (lb)</span>
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  {(grams / 453.592).toLocaleString("en-IN", { maximumFractionDigits: 2 })} lb
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-800 dark:text-teal-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Values update dynamically as you type.</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UnitConverter;
