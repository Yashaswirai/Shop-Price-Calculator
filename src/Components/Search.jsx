import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Products from "./Products";
import Calculator from "./Calculator";
import ProductModal from "./ProductModal";
import ShoppingBill from "./ShoppingBill";
import UnitConverter from "./UnitConverter";
import Toast from "./Toast";
import { defaultProductList } from "../data/defaultProducts";
import { getCategoryForProduct } from "../utils/categories";
import { playSound } from "../utils/audio";

const Search = ({ activeTab = "calculator", setActiveTab, soundEnabled = true }) => {
  // Products state
  const [productList, setProductList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Cart / Bill state
  const [cart, setCart] = useState([]);

  // Modals & Editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Toast notifications
  const [toasts, setToasts] = useState([]);
  const lastDeletedRef = useRef(null);

  // Play audio helper
  const playUiSound = useCallback(
    (type = "click", force = false) => {
      playSound(type, force || soundEnabled);
    },
    [soundEnabled]
  );

  // Toast notification helper
  const showToast = useCallback((message, type = "info", undoAction = null) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev.slice(-3), { id, message, type, undoAction }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load products from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("productList");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize with categories if missing
          const normalized = parsed.map((item) => ({
            ...item,
            category: item.category || getCategoryForProduct(item.product),
          }));
          setProductList(normalized);
          setSelectedProduct(normalized[0]);
          return;
        }
      }
    } catch (err) {
      console.error("Error reading productList from localStorage:", err);
    }

    // Default fallback
    setProductList(defaultProductList);
    setSelectedProduct(defaultProductList[0]);
    localStorage.setItem("productList", JSON.stringify(defaultProductList));
  }, []);

  // Save products to localStorage on change
  useEffect(() => {
    if (productList.length > 0) {
      try {
        localStorage.setItem("productList", JSON.stringify(productList));
      } catch (err) {
        console.error("Error saving productList to localStorage:", err);
      }
    }
  }, [productList]);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("shopCart");
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (err) {
      console.error("Error loading cart:", err);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("shopCart", JSON.stringify(cart));
    } catch (err) {
      console.error("Error saving cart:", err);
    }
  }, [cart]);

  // Delete product with Undo support
  const handleDeleteProduct = (productName) => {
    const itemToDelete = productList.find(
      (p) => p.product.toLowerCase() === productName.toLowerCase()
    );
    if (!itemToDelete) return;

    lastDeletedRef.current = itemToDelete;

    const updated = productList.filter(
      (p) => p.product.toLowerCase() !== productName.toLowerCase()
    );
    setProductList(updated);

    // If deleted product was active, select another
    if (selectedProduct && selectedProduct.product.toLowerCase() === productName.toLowerCase()) {
      setSelectedProduct(updated.length > 0 ? updated[0] : null);
    }

    showToast(`Deleted "${productName}"`, "error", {
      type: "RESTORE_PRODUCT",
      item: itemToDelete,
    });
  };

  // Undo delete
  const handleUndo = (toast) => {
    if (toast.undoAction?.type === "RESTORE_PRODUCT" && toast.undoAction.item) {
      const restored = toast.undoAction.item;
      setProductList((prev) => [...prev, restored]);
      setSelectedProduct(restored);
      playUiSound("success");
      showToast(`Restored "${restored.product}"`, "success");
    }
  };

  // Save product (Add or Update)
  const handleSaveProduct = ({ originalName, product, price_per_kg, category, isUpdate }) => {
    if (isUpdate && originalName) {
      // Updating existing product
      const updated = productList.map((item) =>
        item.product.toLowerCase() === originalName.toLowerCase()
          ? { ...item, product, price_per_kg, category }
          : item
      );
      setProductList(updated);

      if (selectedProduct && selectedProduct.product.toLowerCase() === originalName.toLowerCase()) {
        setSelectedProduct({ product, price_per_kg, category });
      }

      showToast(`Updated "${product}" (₹${price_per_kg}/kg)`, "success");
    } else {
      // Adding new product
      const newItem = { product, price_per_kg, category };
      setProductList((prev) => [newItem, ...prev]);
      setSelectedProduct(newItem);
      showToast(`Added "${product}" to catalog!`, "success");
    }
  };

  // Open edit modal
  const handleEditProduct = (productItem) => {
    setEditingProduct(productItem);
    setIsModalOpen(true);
  };

  // Cart operations
  const handleAddToCart = (cartItem) => {
    setCart((prev) => {
      // Check if identical product with same rate is already in cart
      const existingIdx = prev.findIndex(
        (i) => i.product.toLowerCase() === cartItem.product.toLowerCase()
      );

      if (existingIdx >= 0) {
        // Merge quantities
        const updated = [...prev];
        const existing = updated[existingIdx];
        const combinedQty = existing.quantityGrams + cartItem.quantityGrams;
        const combinedPrice = Math.ceil((existing.price_per_kg / 1000) * combinedQty);

        updated[existingIdx] = {
          ...existing,
          quantityGrams: combinedQty,
          totalPrice: combinedPrice,
        };
        return updated;
      }

      return [cartItem, ...prev];
    });
  };

  const handleUpdateCartItem = (itemId, updates) => {
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveCartItem = (itemId) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    showToast("Item removed from bill", "info");
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Catalog reset
  const handleResetCatalog = useCallback(() => {
    if (
      window.confirm(
        "Reset all products back to default grocery catalog prices? Any custom products will be overwritten."
      )
    ) {
      setProductList(defaultProductList);
      setSelectedProduct(defaultProductList[0]);
      localStorage.setItem("productList", JSON.stringify(defaultProductList));
      playUiSound("reset");
      showToast("Catalog reset to default prices", "success");
    }
  }, [playUiSound, showToast]);

  // Expose reset to window / parent if needed
  useEffect(() => {
    window.__shopResetCatalog = handleResetCatalog;
  }, [handleResetCatalog]);

  const catalogRef = useRef(null);
  const scrollToCatalog = () => {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-8">
      {/* Tab 1: Calculator & Catalog */}
      {activeTab === "calculator" && (
        <motion.div
          key="calculator-tab"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-8"
        >
          {/* Main Interactive Calculator */}
          <section aria-label="Grocery Calculator">
            <Calculator
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
              productList={productList}
              onAddToCart={handleAddToCart}
              playUiSound={playUiSound}
              onNotify={showToast}
              onOpenCatalog={scrollToCatalog}
            />
          </section>

          {/* Product Catalog Section */}
          <section ref={catalogRef} aria-label="Product Catalog" className="pt-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Grocery Catalog
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Click any product to load into calculator. Edit rates or add custom products.
                </p>
              </div>
            </div>

            <Products
              productList={productList}
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
              onOpenAddModal={() => {
                setEditingProduct(null);
                setIsModalOpen(true);
              }}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              playUiSound={playUiSound}
            />
          </section>
        </motion.div>
      )}

      {/* Tab 2: Shopping Bill */}
      {activeTab === "bill" && (
        <motion.div
          key="bill-tab"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <ShoppingBill
            cart={cart}
            onUpdateCartItem={handleUpdateCartItem}
            onRemoveCartItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onBackToCalculator={() => setActiveTab("calculator")}
            playUiSound={playUiSound}
            onNotify={showToast}
          />
        </motion.div>
      )}

      {/* Tab 3: Unit Converter */}
      {activeTab === "converter" && (
        <motion.div
          key="converter-tab"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <UnitConverter playUiSound={playUiSound} />
        </motion.div>
      )}

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSaveProduct={handleSaveProduct}
        initialProduct={editingProduct}
        existingProducts={productList}
        playUiSound={playUiSound}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} onUndo={handleUndo} />
    </div>
  );
};

export default Search;
