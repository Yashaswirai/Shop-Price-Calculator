import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  UploadCloud,
  Camera,
  Sparkles,
  Key,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  Cpu,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  fileToBase64,
  scanWithGemini,
  scanSampleDocument,
  fetchAvailableGeminiModels,
  SAMPLE_DOCUMENTS,
} from "../services/aiScanner";
import { findSemanticMatch } from "../utils/semanticMatcher";
import { formatCurrency } from "../utils/formatters";
import { CATEGORIES, getCategoryForProduct, getCategoryBadgeStyle } from "../utils/categories";

const AiScannerModal = ({
  isOpen,
  onClose,
  catalogue = [],
  onApplyUpdates,
  playUiSound,
  onNotify,
}) => {
  const [apiKey, setApiKey] = useState(() => {
    try {
      return (
        localStorage.getItem("geminiApiKey") ||
        import.meta.env.VITE_GEMINI_API_KEY ||
        ""
      );
    } catch {
      return "";
    }
  });

  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState(() => {
    try {
      return localStorage.getItem("geminiSelectedModel") || "auto";
    } catch {
      return "auto";
    }
  });
  const [availableModels, setAvailableModels] = useState([]);
  const [isCheckingModels, setIsCheckingModels] = useState(false);
  const [modelCheckStatus, setModelCheckStatus] = useState("");

  const [imagePreview, setImagePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState("");
  const [error, setError] = useState("");
  const [showFallbackPrompt, setShowFallbackPrompt] = useState(false);

  const [scannedResults, setScannedResults] = useState([]);
  const [isManualFormOpen, setIsManualFormOpen] = useState(false);

  // Manual entry form fields
  const [manualName, setManualName] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualCategory, setManualCategory] = useState("Other Essentials");

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Reset all modal and scanner data
  const resetModalState = useCallback(() => {
    setScannedResults([]);
    setImagePreview(null);
    setError("");
    setShowFallbackPrompt(false);
    setIsScanning(false);
    setScanProgress("");
    setIsManualFormOpen(false);
    setManualName("");
    setManualPrice("");
    setManualCategory("Other Essentials");
    setShowKeyConfig(false);
  }, []);

  // Handle model checking from Google ModelService
  const handleCheckModels = useCallback(async (keyOverride = null) => {
    const keyToUse = (keyOverride ?? tempApiKey ?? apiKey).trim();
    if (!keyToUse) {
      setModelCheckStatus("Please enter an API key first.");
      return;
    }

    setIsCheckingModels(true);
    setModelCheckStatus("Checking models via Google ModelService...");

    try {
      const result = await fetchAvailableGeminiModels(keyToUse);
      setAvailableModels(result.models);
      const rec = result.recommendedModel.replace(/^models\//, "");
      setModelCheckStatus(`✓ Found ${result.models.length} active models (Recommended: ${rec})`);
      playUiSound?.("success");
    } catch (err) {
      setModelCheckStatus(`⚠️ ${err.message}`);
      playUiSound?.("delete");
    } finally {
      setIsCheckingModels(false);
    }
  }, [apiKey, tempApiKey, playUiSound]);

  // Safe close handler that always clears session state
  const handleClose = useCallback(() => {
    resetModalState();
    onClose();
  }, [onClose, resetModalState]);

  // Reset modal state when closed or opened & pre-check models if key exists
  useEffect(() => {
    if (!isOpen) {
      resetModalState();
    } else {
      setTempApiKey(apiKey);
      if (apiKey && availableModels.length === 0) {
        handleCheckModels(apiKey);
      }
    }
  }, [isOpen, apiKey, availableModels.length, handleCheckModels, resetModalState]);

  // Handle ESC key to cancel & reset
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Sync API Key to localStorage & verify models
  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    const key = tempApiKey.trim();
    setApiKey(key);
    try {
      localStorage.setItem("geminiApiKey", key);
    } catch {
      // ignore
    }
    playUiSound?.("success");
    if (key) {
      onNotify?.("Gemini API key saved! Checking available models...", "success");
      await handleCheckModels(key);
    } else {
      onNotify?.("API key cleared. Running in Demo mode.", "info");
      setAvailableModels([]);
      setModelCheckStatus("");
    }
  };

  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
    try {
      localStorage.setItem("geminiSelectedModel", modelId);
    } catch {
      // ignore
    }
    playUiSound?.("click");
    onNotify?.(
      modelId === "auto"
        ? "Vision Model set to Auto-Detect (Recommended)"
        : `Selected model: ${modelId.replace(/^models\//, "")}`,
      "info"
    );
  };

  // Handle uploaded file
  const handleFileSelect = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP).");
      setShowFallbackPrompt(true);
      playUiSound?.("delete");
      return;
    }

    try {
      playUiSound?.("click");
      setError("");
      setShowFallbackPrompt(false);
      const base64 = await fileToBase64(file);
      setImagePreview(base64);
      processImage(base64);
    } catch (err) {
      setError("Failed to read image file: " + err.message);
      setShowFallbackPrompt(true);
    }
  };

  // Process image with Gemini or Smart Fallback
  const processImage = async (base64) => {
    setIsScanning(true);
    setScanProgress("Checking models and analyzing document...");
    setError("");
    setShowFallbackPrompt(false);

    try {
      let results = [];
      if (apiKey.trim()) {
        results = await scanWithGemini(
          base64,
          catalogue,
          apiKey.trim(),
          selectedModel,
          (statusText) => setScanProgress(statusText)
        );
      } else {
        // Fallback or demo notification
        setScanProgress("Reading items & matching synonyms via Semantic AI...");
        results = await scanSampleDocument("sample_grocery_bill", catalogue);
        onNotify?.(
          "Processed via Built-in Semantic AI Matcher! (Add Gemini API key in settings for live camera OCR).",
          "info"
        );
      }

      if (!results || results.length === 0) {
        throw new Error("No readable grocery products or prices could be extracted from this document.");
      }

      setScannedResults(results);
      playUiSound?.("success");
      if (results.usedModel) {
        const friendly = results.usedModel.replace(/^models\//, "");
        onNotify?.(`Extracted items using ${friendly}`, "success");
      }
    } catch (err) {
      setError(err.message || "AI was unable to understand or extract items from this document.");
      setShowFallbackPrompt(true);
      playUiSound?.("delete");
    } finally {
      setIsScanning(false);
      setScanProgress("");
    }
  };

  // Try sample bill
  const handleTrySample = async (sampleId) => {
    try {
      playUiSound?.("click");
      setError("");
      setShowFallbackPrompt(false);
      setIsScanning(true);
      setScanProgress("Loading sample bill & matching products with AI...");
      setImagePreview(null);

      const results = await scanSampleDocument(sampleId, catalogue);
      setScannedResults(results);
      playUiSound?.("success");
    } catch (err) {
      setError(err.message || "Failed to load sample document.");
      setShowFallbackPrompt(true);
    } finally {
      setIsScanning(false);
      setScanProgress("");
    }
  };

  // Live match preview for manual entry
  const manualSemanticMatch = manualName.trim()
    ? findSemanticMatch(manualName.trim(), catalogue)
    : { matchedProduct: null, confidence: "none", reason: "" };

  // Auto-set category when manual name changes
  const handleManualNameChange = (e) => {
    const val = e.target.value;
    setManualName(val);
    const match = findSemanticMatch(val.trim(), catalogue);
    if (match.matchedProduct) {
      setManualCategory(match.matchedProduct.category || getCategoryForProduct(match.matchedProduct.product));
    } else if (val.trim()) {
      setManualCategory(getCategoryForProduct(val.trim()));
    }
  };

  // Add item manually to review list
  const handleAddManualItem = (e) => {
    e.preventDefault();
    const trimmedName = manualName.trim();
    const priceNum = Math.ceil(Number(manualPrice)) || 0;

    if (!trimmedName) {
      onNotify?.("Please enter a product name.", "error");
      playUiSound?.("delete");
      return;
    }

    if (priceNum <= 0) {
      onNotify?.("Please enter a valid price per kg greater than 0.", "error");
      playUiSound?.("delete");
      return;
    }

    const match = manualSemanticMatch.matchedProduct;
    const isExisting = Boolean(match);
    const oldPrice = isExisting ? match.price_per_kg : null;
    const priceDiff = isExisting ? priceNum - oldPrice : 0;

    const newItem = {
      id: `manual-${Date.now()}`,
      selected: true,
      detected_name: trimmedName,
      target_product_name: isExisting ? match.product : trimmedName,
      matched_product: match,
      is_new: !isExisting,
      confidence: isExisting ? "high" : "none",
      reason: isExisting
        ? `Manually mapped to catalogue item "${match.product}"`
        : "Entered as new catalogue product",
      price_per_kg: priceNum,
      old_price: oldPrice,
      price_diff: priceDiff,
      category: manualCategory,
    };

    setScannedResults((prev) => [newItem, ...prev]);
    playUiSound?.("cart");
    onNotify?.(`Added "${newItem.target_product_name}" to update list!`, "success");

    // Reset manual fields
    setManualName("");
    setManualPrice("");
    setManualCategory("Other Essentials");
    setShowFallbackPrompt(false);
    setError("");
  };

  // Toggle item selection
  const handleToggleItem = (id) => {
    playUiSound?.("click");
    setScannedResults((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  // Delete item from review list
  const handleDeleteItem = (id) => {
    playUiSound?.("delete");
    setScannedResults((prev) => prev.filter((item) => item.id !== id));
  };

  // Update target product mapping from dropdown
  const handleTargetProductChange = (id, targetProductName) => {
    playUiSound?.("click");
    setScannedResults((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (targetProductName === "__new__") {
            return {
              ...item,
              target_product_name: item.detected_name,
              matched_product: null,
              is_new: true,
              old_price: null,
              price_diff: 0,
              reason: "Configured as a new catalogue product",
            };
          }

          const matched = catalogue.find(
            (p) => p.product.toLowerCase() === targetProductName.toLowerCase()
          );
          if (matched) {
            const oldPrice = matched.price_per_kg;
            return {
              ...item,
              target_product_name: matched.product,
              matched_product: matched,
              is_new: false,
              old_price: oldPrice,
              price_diff: item.price_per_kg - oldPrice,
              category: matched.category || item.category,
              reason: `Manually mapped to catalogue item "${matched.product}"`,
            };
          }
        }
        return item;
      })
    );
  };

  // Update scanned item values in table
  const handleUpdateItemValue = (id, field, value) => {
    setScannedResults((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "price_per_kg") {
            const num = Math.ceil(Number(value)) || 0;
            updated.price_per_kg = num;
            updated.price_diff = updated.old_price !== null ? num - updated.old_price : 0;
          }
          return updated;
        }
        return item;
      })
    );
  };

  // Select all or Deselect all
  const handleToggleAll = (select) => {
    playUiSound?.("click");
    setScannedResults((prev) => prev.map((item) => ({ ...item, selected: select })));
  };

  // Apply updates to catalogue
  const handleApply = () => {
    const selectedItems = scannedResults.filter((i) => i.selected);
    if (selectedItems.length === 0) {
      onNotify?.("Please select at least one item to apply.", "error");
      playUiSound?.("delete");
      return;
    }

    const updates = [];
    const additions = [];

    selectedItems.forEach((item) => {
      if (item.matched_product) {
        updates.push({
          product: item.matched_product.product,
          price_per_kg: Math.ceil(item.price_per_kg),
          category: item.category,
        });
      } else {
        additions.push({
          product: item.target_product_name,
          price_per_kg: Math.ceil(item.price_per_kg),
          category: item.category,
        });
      }
    });

    playUiSound?.("success");
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });

    onApplyUpdates({ updates, additions });
    onNotify?.(
      `Catalogue updated: ${updates.length} price${updates.length === 1 ? "" : "s"} updated, ${additions.length} new product${additions.length === 1 ? "" : "s"} added!`,
      "success"
    );

    handleClose();
  };

  const selectedCount = scannedResults.filter((i) => i.selected).length;
  const updateCount = scannedResults.filter((i) => i.selected && !i.is_new).length;
  const newCount = scannedResults.filter((i) => i.selected && i.is_new).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center sm:p-4 md:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Container: Mobile-First full screen on phones, rounded card on sm/md */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative w-full h-full sm:h-auto sm:max-h-[92vh] max-w-4xl bg-white dark:bg-gray-800 sm:rounded-3xl shadow-2xl border-0 sm:border border-gray-200 dark:border-gray-700 overflow-hidden z-10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/90 dark:bg-gray-800/90 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                      AI Bill & Doc Scanner
                    </h3>
                    <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Smart Match
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 hidden sm:block">
                    Extracts items, matches synonyms (e.g. Flour ↔ Aata), and updates rates.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Manual entry toggle button */}
                <button
                  onClick={() => setIsManualFormOpen(!isManualFormOpen)}
                  className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isManualFormOpen
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                  }`}
                  title="Manual Entry"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {isManualFormOpen ? "Hide Manual" : "Manual"}
                  </span>
                </button>

                {/* API Key settings toggle */}
                <button
                  onClick={() => setShowKeyConfig(!showKeyConfig)}
                  className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    apiKey
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                  }`}
                  title="Configure Gemini API Key & Vision Models"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {apiKey ? (selectedModel !== "auto" ? selectedModel.replace(/^models\//, "") : "AI Models") : "AI Key"}
                  </span>
                </button>

                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* API Key & Model Configuration Drawer */}
            <AnimatePresence>
              {showKeyConfig && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-emerald-950/10 dark:bg-emerald-950/20 border-b border-emerald-500/20 px-4 sm:px-6 py-3.5 overflow-hidden shrink-0 space-y-3"
                >
                  <form onSubmit={handleSaveApiKey} className="space-y-2.5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5" />
                          Google Gemini Vision API Key & Model
                        </h4>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400">
                          Enables live real-time OCR extraction for uploaded camera photos and paper bills.
                        </p>
                      </div>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 underline hover:text-emerald-500"
                      >
                        Get Free Key from Google AI Studio →
                      </a>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Paste your Gemini API key (AIzaSy...)"
                        value={tempApiKey}
                        onChange={(e) => setTempApiKey(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer shrink-0"
                      >
                        Save Key
                      </button>
                    </div>
                  </form>

                  {/* Model Selection & Auto-Detection Row */}
                  <div className="pt-2 border-t border-emerald-500/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mb-1">
                        <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Active Gemini Vision Model:
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedModel}
                          onChange={(e) => handleModelChange(e.target.value)}
                          className="flex-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                          <option value="auto">✨ Auto-Detect Best Active Model (Recommended)</option>
                          {availableModels.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.displayName} ({m.id.replace(/^models\//, "")})
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => handleCheckModels()}
                          disabled={isCheckingModels || !tempApiKey.trim()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                          title="Query Google ModelService for available models"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isCheckingModels ? "animate-spin" : ""}`} />
                          <span className="hidden sm:inline">{isCheckingModels ? "Checking..." : "Check Models"}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {modelCheckStatus && (
                    <div className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                      {modelCheckStatus}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Manual Entry Drawer */}
            <AnimatePresence>
              {isManualFormOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-amber-500/10 dark:bg-amber-950/20 border-b border-amber-500/25 px-4 sm:px-6 py-3.5 overflow-hidden shrink-0"
                >
                  <form onSubmit={handleAddManualItem} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5" />
                        Quick Manual Bill Entry
                      </h4>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 hidden sm:inline">
                        Type any name — AI automatically recognizes catalogue synonyms!
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Product Name (e.g. Flour, Rice, Sugar)"
                          value={manualName}
                          onChange={handleManualNameChange}
                          className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="Price/kg (₹)"
                          value={manualPrice}
                          onChange={(e) => setManualPrice(e.target.value)}
                          className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                        />

                        <div className="sm:hidden">
                          <select
                            value={manualCategory}
                            onChange={(e) => setManualCategory(e.target.value)}
                            className="w-full px-2 py-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <div className="hidden sm:block flex-1">
                          <select
                            value={manualCategory}
                            onChange={(e) => setManualCategory(e.target.value)}
                            className="w-full px-2 py-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="submit"
                          className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center justify-center gap-1 shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Item
                        </button>
                      </div>
                    </div>

                    {/* Live Match Preview Indicator */}
                    {manualName.trim() && (
                      <div className="text-[11px] flex items-center gap-1.5 pt-0.5">
                        {manualSemanticMatch.matchedProduct ? (
                          <span className="text-emerald-700 dark:text-emerald-300 font-medium inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>
                              AI Match: <b>&quot;{manualName}&quot;</b> maps to catalogue <b>&quot;{manualSemanticMatch.matchedProduct.product}&quot;</b> (Current: ₹{manualSemanticMatch.matchedProduct.price_per_kg}/kg)
                            </span>
                          </span>
                        ) : (
                          <span className="text-blue-700 dark:text-blue-300 font-medium inline-flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>New product not in catalogue — will be added as <b>&quot;{manualName}&quot;</b></span>
                          </span>
                        )}
                      </div>
                    )}
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scrollable Body: Mobile-First optimized */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1">
              {/* Fallback Prompt when AI is unable to understand */}
              {showFallbackPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-3"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                        AI was unable to understand or extract items from this document
                      </h4>
                      <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-300 mt-1">
                        {error || "The image might be blurry, handwritten, or in an unsupported orientation."}
                      </p>
                      <p className="text-[11px] sm:text-xs font-semibold text-amber-800 dark:text-amber-300 mt-1">
                        Would you like to enter the items manually or try another photo?
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 pt-1 sm:pl-10">
                    {/model|modelservice|api version|not found|supported/i.test(error) && (
                      <button
                        onClick={() => {
                          setShowKeyConfig(true);
                          handleCheckModels(apiKey);
                          playUiSound?.("click");
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Check & Switch Supported Models
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsManualFormOpen(true);
                        setShowFallbackPrompt(false);
                        setError("");
                        playUiSound?.("click");
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-sm cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Enter Items Manually
                    </button>

                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setError("");
                        setShowFallbackPrompt(false);
                        cameraInputRef.current?.click();
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Take Another Photo
                    </button>

                    <button
                      onClick={() => handleTrySample("sample_grocery_bill")}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline cursor-pointer"
                    >
                      Use Sample Bill
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Upload & Drag Zone: Mobile-First prominent photo capture */}
              {scannedResults.length === 0 && !showFallbackPrompt && (
                <div className="space-y-4">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) {
                        handleFileSelect(e.dataTransfer.files[0]);
                      }
                    }}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-emerald-500 rounded-3xl p-5 sm:p-10 text-center transition-all bg-gray-50/50 dark:bg-gray-800/40 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    />

                    {imagePreview ? (
                      <div className="max-w-xs mx-auto space-y-3">
                        <img
                          src={imagePreview}
                          alt="Uploaded receipt"
                          className="max-h-48 mx-auto rounded-xl object-contain shadow-md"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Document loaded. Tap to replace.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl sm:rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <UploadCloud className="w-6 h-6 sm:w-7 sm:h-7" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                            Scan Receipt, Grocery Bill, or Price List
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                            Snap a bill photo or upload an image. AI will extract items & rates automatically.
                          </p>
                        </div>

                        {/* Mobile-first Action Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-md mx-auto pt-1">
                          {/* Camera button: Primary on mobile */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              cameraInputRef.current?.click();
                            }}
                            className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 cursor-pointer"
                          >
                            <Camera className="w-4 h-4" />
                            Take Photo
                          </button>

                          {/* Browse files */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                            Upload File
                          </button>

                          {/* Manual entry */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsManualFormOpen(true);
                            }}
                            className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                            Manual Entry
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sample Bills for Quick Demo */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        Try Instant Demo Invoices
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SAMPLE_DOCUMENTS.map((sample) => (
                        <button
                          key={sample.id}
                          onClick={() => handleTrySample(sample.id)}
                          className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-500 text-left transition-all cursor-pointer group"
                        >
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="font-bold text-xs text-gray-900 dark:text-white truncate">
                              {sample.name}
                            </h5>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                              {sample.desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Scanning Loader State */}
              {isScanning && (
                <div className="py-10 sm:py-12 text-center space-y-4">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                    <div className="absolute inset-2 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                      AI is Reading Document
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 animate-pulse">
                      {scanProgress}
                    </p>
                  </div>
                </div>
              )}

              {/* Results Review Section: Mobile-First item cards */}
              {!isScanning && scannedResults.length > 0 && (
                <div className="space-y-3.5">
                  {/* Top Stats & Quick Actions Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        Items ({scannedResults.length})
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded-full font-semibold">
                        {updateCount} updates
                      </span>
                      <span className="text-[11px] text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.2 rounded-full font-semibold">
                        {newCount} new
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <button
                        onClick={() => handleToggleAll(true)}
                        className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <button
                        onClick={() => handleToggleAll(false)}
                        className="font-semibold text-gray-500 dark:text-gray-400 hover:underline cursor-pointer"
                      >
                        Deselect All
                      </button>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <button
                        onClick={() => setIsManualFormOpen(!isManualFormOpen)}
                        className="font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Manual Item
                      </button>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <button
                        onClick={resetModalState}
                        className="font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer inline-flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Scanned Items: Mobile-First Card Structure */}
                  <div className="space-y-3 max-h-[50vh] sm:max-h-[460px] overflow-y-auto pr-0.5">
                    {scannedResults.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          item.selected
                            ? "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-xs"
                            : "bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 opacity-60"
                        }`}
                      >
                        {/* 1. Header: Checkbox + Extracted Name + Tag + Delete */}
                        <div className="flex items-start justify-between gap-2.5 mb-2.5">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={() => handleToggleItem(item.id)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600 shrink-0"
                            />
                            <div className="min-w-0">
                              <h5 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                {item.detected_name}
                              </h5>
                              <span className="text-[10px] text-gray-400 block -mt-0.5">
                                Extracted from document
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.is_new ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                New Entry
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                Updates Existing
                              </span>
                            )}

                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                              title="Remove from update list"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* 2. Target Mapping Dropdown */}
                        <div className="space-y-1 mb-2.5">
                          <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block">
                            Maps to Catalogue Product:
                          </label>
                          <select
                            value={item.matched_product ? item.matched_product.product : "__new__"}
                            onChange={(e) => handleTargetProductChange(item.id, e.target.value)}
                            className="w-full text-xs font-semibold px-2.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                          >
                            <option value="__new__">
                              ➕ Add as New Product: &quot;{item.detected_name}&quot;
                            </option>
                            <optgroup label="Or match to existing catalogue product:">
                              {catalogue.map((catItem, idx) => (
                                <option key={idx} value={catItem.product}>
                                  Update: {catItem.product} (Current: ₹{catItem.price_per_kg}/kg)
                                </option>
                              ))}
                            </optgroup>
                          </select>
                        </div>

                        {/* 3. Reason Note & Category */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2.5">
                          <p className="text-[11px] leading-tight text-gray-600 dark:text-gray-300 flex-1 min-w-[200px]">
                            {item.reason}
                          </p>
                          <span
                            className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryBadgeStyle(
                              item.category
                            )}`}
                          >
                            {item.category}
                          </span>
                        </div>

                        {/* 4. Footer: Old vs New Price & Rate Input */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/60">
                          <div className="text-xs">
                            {item.old_price !== null ? (
                              <div>
                                <span className="text-gray-400 text-[11px]">Old: {formatCurrency(item.old_price)}</span>
                                <span
                                  className={`ml-1.5 font-bold ${
                                    item.price_diff > 0
                                      ? "text-rose-500"
                                      : item.price_diff < 0
                                      ? "text-emerald-500"
                                      : "text-gray-400"
                                  }`}
                                >
                                  ({item.price_diff > 0 ? "+" : item.price_diff < 0 ? "-" : ""}
                                  {item.price_diff === 0 ? "No change" : formatCurrency(Math.abs(item.price_diff))})
                                </span>
                              </div>
                            ) : (
                              <span className="text-blue-500 dark:text-blue-400 text-[11px] font-semibold">
                                New Product
                              </span>
                            )}
                          </div>

                          {/* Rate Input */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-500 font-bold hidden sm:inline">New Rate:</span>
                            <span className="text-xs text-gray-400 font-bold">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={item.price_per_kg}
                              onChange={(e) => handleUpdateItemValue(item.id, "price_per_kg", e.target.value)}
                              className="w-18 px-2 py-1 text-sm font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                            />
                            <span className="text-xs text-gray-400">/kg</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions: Mobile-First layout */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-100 dark:border-gray-700/80 bg-gray-50/90 dark:bg-gray-800/90 shrink-0">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
                {scannedResults.length > 0 ? (
                  <span>
                    Selected: <b>{selectedCount}</b> item{selectedCount === 1 ? "" : "s"} ({updateCount} updates, {newCount} new)
                  </span>
                ) : (
                  <span>AI recognizes products even with different names.</span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>

                {scannedResults.length > 0 && (
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={selectedCount === 0}
                    className="flex-2 sm:flex-initial inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Apply to Catalogue ({selectedCount})
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AiScannerModal;
