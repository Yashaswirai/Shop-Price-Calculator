import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tag, IndianRupee, Layers, Check, AlertCircle } from "lucide-react";
import { CATEGORIES, getCategoryForProduct } from "../utils/categories";
import { formatCurrency } from "../utils/formatters";

const ProductModal = ({
  isOpen,
  onClose,
  onSaveProduct,
  initialProduct = null,
  existingProducts = [],
  playUiSound,
}) => {
  const [productName, setProductName] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [category, setCategory] = useState("Other Essentials");
  const [error, setError] = useState("");

  const isEditing = Boolean(initialProduct);

  useEffect(() => {
    if (initialProduct) {
      setProductName(initialProduct.product || "");
      setPricePerKg(String(initialProduct.price_per_kg || ""));
      setCategory(
        initialProduct.category || getCategoryForProduct(initialProduct.product)
      );
      setError("");
    } else {
      setProductName("");
      setPricePerKg("");
      setCategory("Other Essentials");
      setError("");
    }
  }, [initialProduct, isOpen]);

  // Handle auto-suggest category on typing name
  const handleNameChange = (e) => {
    const val = e.target.value;
    setProductName(val);
    if (!isEditing && val.trim().length > 2) {
      const suggested = getCategoryForProduct(val);
      if (suggested) {
        setCategory(suggested);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = productName.trim();
    const priceNum = Number(pricePerKg);

    if (!trimmedName) {
      setError("Please provide a product name.");
      playUiSound?.("delete");
      return;
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Please enter a valid price per kg greater than 0.");
      playUiSound?.("delete");
      return;
    }

    // Check duplicate if not editing or if renamed to another existing product
    const duplicate = existingProducts.find(
      (p) =>
        p.product.toLowerCase() === trimmedName.toLowerCase() &&
        (!isEditing ||
          p.product.toLowerCase() !== initialProduct.product.toLowerCase())
    );

    if (duplicate) {
      setError(
        `A product named "${trimmedName}" already exists with price ₹${duplicate.price_per_kg}/kg.`
      );
      playUiSound?.("delete");
      return;
    }

    playUiSound?.("success");
    onSaveProduct({
      originalName: initialProduct ? initialProduct.product : null,
      product: trimmedName,
      price_per_kg: priceNum,
      category,
      isUpdate: isEditing,
    });
    onClose();
  };

  const previewPrice = Number(pricePerKg) || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  {isEditing ? <Tag className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {isEditing ? "Edit Product Details" : "Add New Product"}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                  Product Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Tag className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={productName}
                    onChange={handleNameChange}
                    placeholder="e.g. Basmati Rice, Moong Dal"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {/* Price Per Kg */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                  Price Per Kilogram (₹ / kg)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(e.target.value)}
                    placeholder="e.g. 65"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                  Category
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all"
                  >
                    {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live Rate Preview */}
              {previewPrice > 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-xs">
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1.5">
                    Live Rate Breakdown:
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/60 dark:bg-gray-800/60 p-1.5 rounded-lg">
                      <span className="text-gray-500 dark:text-gray-400 block">100g</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(previewPrice / 10)}
                      </span>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/60 p-1.5 rounded-lg">
                      <span className="text-gray-500 dark:text-gray-400 block">250g</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(previewPrice / 4)}
                      </span>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/60 p-1.5 rounded-lg">
                      <span className="text-gray-500 dark:text-gray-400 block">500g</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(previewPrice / 2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {isEditing ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;
