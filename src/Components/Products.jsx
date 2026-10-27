import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search as SearchIcon,
  X,
  Plus,
  Edit2,
  Trash2,
  ArrowUpDown,
  LayoutGrid,
  List,
  CheckCircle,
  Tag,
} from "lucide-react";
import { CATEGORIES, getCategoryForProduct, getCategoryBadgeStyle } from "../utils/categories";

const Products = ({
  productList = [],
  selectedProduct,
  onSelectProduct,
  onOpenAddModal,
  onEditProduct,
  onDeleteProduct,
  playUiSound,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  // Filter and sort products
  const filteredAndSorted = useMemo(() => {
    let result = [...productList];

    // Filter by search
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter((item) =>
        item.product.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((item) => {
        const cat = item.category || getCategoryForProduct(item.product);
        return cat === selectedCategory;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "name-asc") {
        return a.product.localeCompare(b.product);
      }
      if (sortBy === "name-desc") {
        return b.product.localeCompare(a.product);
      }
      if (sortBy === "price-asc") {
        return a.price_per_kg - b.price_per_kg;
      }
      if (sortBy === "price-desc") {
        return b.price_per_kg - a.price_per_kg;
      }
      return 0;
    });

    return result;
  }, [productList, searchTerm, selectedCategory, sortBy]);

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts = { all: productList.length };
    productList.forEach((item) => {
      const cat = item.category || getCategoryForProduct(item.product);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [productList]);

  return (
    <div className="space-y-4">
      {/* Search, Filter & Actions Top Bar */}
      <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <SearchIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products (e.g. Aata, Chawal, Moong)..."
              className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  playUiSound?.("click");
                  setSearchTerm("");
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => {
                  playUiSound?.("click");
                  setSortBy(e.target.value);
                }}
                className="pl-3 pr-8 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="name-asc">Alphabetical (A - Z)</option>
                <option value="name-desc">Alphabetical (Z - A)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            {/* View Mode Grid/List */}
            <div className="hidden sm:flex rounded-xl bg-gray-100 dark:bg-gray-700 p-1">
              <button
                onClick={() => {
                  playUiSound?.("click");
                  setViewMode("grid");
                }}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  playUiSound?.("click");
                  setViewMode("list");
                }}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Add Product Button */}
            <button
              onClick={() => {
                playUiSound?.("click");
                onOpenAddModal();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  playUiSound?.("click");
                  setSelectedCategory(cat.id);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                    : "bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Items Display */}
      {filteredAndSorted.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80">
          <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-60" />
          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            No products match your search
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your search terms or category filter.
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
            >
              Add New Product
            </button>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5"
        >
          <AnimatePresence>
            {filteredAndSorted.map((item) => {
              const isSelected = selectedProduct && selectedProduct.product === item.product;
              const category = item.category || getCategoryForProduct(item.product);

              return (
                <motion.div
                  layout
                  key={item.product}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -3 }}
                  onClick={() => {
                    playUiSound?.("select");
                    onSelectProduct(item);
                  }}
                  className={`relative p-4 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500 dark:border-emerald-400 shadow-md ring-2 ring-emerald-500/20"
                      : "bg-white dark:bg-gray-800/80 hover:bg-gray-50/90 dark:hover:bg-gray-750 border-gray-200 dark:border-gray-700/80 shadow-xs"
                  }`}
                >
                  {/* Top Bar with category & edit/delete */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border truncate max-w-[120px] ${getCategoryBadgeStyle(
                        category
                      )}`}
                    >
                      {category}
                    </span>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          playUiSound?.("click");
                          onEditProduct(item);
                        }}
                        className="p-1 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          playUiSound?.("delete");
                          onDeleteProduct(item.product);
                        }}
                        className="p-1 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Product Title */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                      {item.product}
                    </h4>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                  </div>

                  {/* Price Tags */}
                  <div className="flex items-baseline justify-between pt-2 border-t border-gray-100 dark:border-gray-700/60">
                    <div>
                      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₹{item.price_per_kg}
                      </span>
                      <span className="text-[11px] text-gray-400 ml-1">/ kg</span>
                    </div>
                    <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                      ₹{Math.ceil(item.price_per_kg / 10)}/100g
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* List View */
        <motion.div layout className="space-y-2">
          {filteredAndSorted.map((item) => {
            const isSelected = selectedProduct && selectedProduct.product === item.product;
            const category = item.category || getCategoryForProduct(item.product);

            return (
              <motion.div
                layout
                key={item.product}
                onClick={() => {
                  playUiSound?.("select");
                  onSelectProduct(item);
                }}
                className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/30"
                    : "bg-white dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-750 border-gray-200 dark:border-gray-700/80"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {item.product.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                      {item.product}
                    </h4>
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.2 rounded-full border ${getCategoryBadgeStyle(
                        category
                      )}`}
                    >
                      {category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{item.price_per_kg}/kg
                    </span>
                    <span className="text-[11px] text-gray-400 block">
                      ₹{Math.ceil(item.price_per_kg / 10)}/100g
                    </span>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        playUiSound?.("click");
                        onEditProduct(item);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Edit product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        playUiSound?.("delete");
                        onDeleteProduct(item.product);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Delete product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default Products;
