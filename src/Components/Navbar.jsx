import { motion } from "framer-motion";
import {
  ShoppingBag,
  Calculator,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Receipt,
  Scale,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const Navbar = ({
  activeTab,
  setActiveTab,
  cartCount,
  cartTotal,
  onOpenCart,
  darkMode,
  setDarkMode,
  soundEnabled,
  setSoundEnabled,
  onResetCatalog,
  playUiSound,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <div className="container mx-auto px-4 py-3">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => {
              playUiSound("click");
              setActiveTab("calculator");
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 dark:from-emerald-600 dark:to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 leading-tight">
                  Shop Price
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-2.5 h-2.5" />
                  Smart Cal
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                Instant Grocery Price & Quantity Calculator
              </p>
            </div>
          </div>

          {/* Controls & Quick Cart Button */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Active Bill / Cart Pill */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                playUiSound("cart");
                onOpenCart();
              }}
              className="relative inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer shadow-sm"
              title="View Shopping Bill"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Bill:</span>
              <span className="font-bold">₹{Math.ceil(cartTotal)}</span>
              {cartCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-emerald-600 rounded-full animate-pulse">
                  {cartCount}
                </span>
              )}
            </motion.button>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                const nextState = !soundEnabled;
                setSoundEnabled(nextState);
                if (nextState) playUiSound("click", true);
              }}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700/60 transition-colors cursor-pointer"
              title={soundEnabled ? "Mute audio feedback" : "Enable audio feedback"}
              aria-label="Toggle Sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => {
                playUiSound("click");
                setDarkMode(!darkMode);
              }}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700/60 transition-colors cursor-pointer"
              title={darkMode ? "Switch to light theme" : "Switch to dark theme"}
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Reset Catalog */}
            <button
              onClick={() => {
                playUiSound("click");
                onResetCatalog();
              }}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-colors cursor-pointer"
              title="Reset product catalog to default prices"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Prices
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-center sm:justify-start gap-1 mt-3 border-t border-gray-100 dark:border-gray-800/80 pt-2">
          <button
            onClick={() => {
              playUiSound("click");
              setActiveTab("calculator");
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "calculator"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/30"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Calculator & Catalog
          </button>

          <button
            onClick={() => {
              playUiSound("click");
              setActiveTab("bill");
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "bill"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/30"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Active Bill
            {cartCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              playUiSound("click");
              setActiveTab("converter");
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "converter"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/30"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Unit Converter
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
