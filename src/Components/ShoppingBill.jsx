import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Printer,
  Share2,
  Copy,
  Receipt,
  Check,
  ArrowLeft,
} from "lucide-react";
import confetti from "canvas-confetti";
import { formatCurrency, formatWeight } from "../utils/formatters";

const ShoppingBill = ({
  cart = [],
  onUpdateCartItem,
  onRemoveCartItem,
  onClearCart,
  onBackToCalculator,
  playUiSound,
  onNotify,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [copied, setCopied] = useState(false);

  // Calculate bill totals (rounded up to next whole rupee)
  const totalItems = cart.reduce((acc, item) => acc + (item.count || 1), 0);
  const totalWeightGrams = cart.reduce((acc, item) => acc + (item.quantityGrams || 0), 0);
  const rawSubtotal = cart.reduce((acc, item) => acc + Math.ceil(item.totalPrice || 0), 0);
  const grandTotal = Math.ceil(rawSubtotal);

  // Print receipt
  const handlePrint = () => {
    playUiSound?.("click");
    window.print();
  };

  // Generate plain-text receipt for WhatsApp / Clipboard
  const generateBillText = () => {
    const dateStr = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    let text = `🛒 *SHOP PRICE RECEIPT*\n`;
    text += `📅 ${dateStr}\n`;
    if (customerName.trim()) {
      text += `👤 Customer: ${customerName.trim()}\n`;
    }
    text += `--------------------------------\n`;

    cart.forEach((item, index) => {
      text += `${index + 1}. *${item.product}*\n`;
      text += `   ${formatWeight(item.quantityGrams)} @ ₹${item.price_per_kg}/kg = *${formatCurrency(item.totalPrice)}*\n`;
    });

    text += `--------------------------------\n`;
    text += `📦 Total Items: ${cart.length} (${formatWeight(totalWeightGrams)})\n`;
    text += `💰 *Grand Total: ${formatCurrency(grandTotal)}*\n`;
    text += `Thank you for shopping with us!`;

    return text;
  };

  const handleCopyBill = () => {
    playUiSound?.("success");
    const billText = generateBillText();
    navigator.clipboard.writeText(billText).then(() => {
      setCopied(true);
      onNotify?.("Bill copied to clipboard! Ready to paste in WhatsApp.", "success");
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleShareWhatsApp = () => {
    playUiSound?.("success");
    const billText = generateBillText();
    const encoded = encodeURIComponent(billText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  const handleCheckoutComplete = () => {
    playUiSound?.("success");
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    onNotify?.("Order completed! Ready for new calculation.", "success");
  };

  if (cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto py-12 px-4 text-center"
      >
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Your Shopping Bill is Empty
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6 text-sm">
          Select items in the Calculator and click &quot;Add to Bill&quot; to build an
          itemized bill with live totals, instant print, and WhatsApp sharing.
        </p>
        <button
          onClick={() => {
            playUiSound?.("click");
            onBackToCalculator?.();
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Calculator
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => {
              playUiSound?.("click");
              onBackToCalculator?.();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Calculator
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
            Active Shopping Bill
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {cart.length} item{cart.length > 1 ? "s" : ""} • Total weight:{" "}
            {formatWeight(totalWeightGrams)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyBill}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 shadow-sm transition-all cursor-pointer"
            title="Copy formatted receipt text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all cursor-pointer"
            title="Share via WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 shadow-sm transition-all cursor-pointer"
            title="Print receipt"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear all items in this bill?")) {
                playUiSound?.("reset");
                onClearCart();
                onNotify?.("Bill cleared", "info");
              }
            }}
            className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer shrink-0"
            title="Clear entire bill"
            aria-label="Clear entire bill"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Item List Column */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {cart.map((item, index) => (
              <motion.div
                key={item.id || `${item.product}-${index}`}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm transition-all"
              >
                {/* Responsive Card Container */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Top section (Mobile) / Left section (Desktop): Product name, rate, and mobile delete button */}
                  <div className="flex items-start justify-between gap-2 min-w-0 sm:flex-1">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                          {item.product}
                        </h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          Rate: <b className="text-gray-700 dark:text-gray-300">₹{item.price_per_kg}/kg</b>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Qty: {formatWeight(item.quantityGrams)}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Delete Button */}
                    <button
                      onClick={() => {
                        playUiSound?.("delete");
                        onRemoveCartItem(item.id);
                      }}
                      className="sm:hidden p-2 -mr-1 -mt-1 text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                      title="Remove item"
                      aria-label={`Remove ${item.product}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bottom section (Mobile) / Right section (Desktop): Stepper + Total Price + Desktop Delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-750 shrink-0">
                    {/* Stepper with comfortable touch targets */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700/60 rounded-xl p-0.5 border border-gray-200 dark:border-gray-600/50">
                      <button
                        onClick={() => {
                          playUiSound?.("click");
                          const step = item.quantityGrams > 500 ? 250 : 100;
                          const newQty = Math.max(50, item.quantityGrams - step);
                          const newPrice = Math.ceil((item.price_per_kg / 1000) * newQty);
                          onUpdateCartItem(item.id, { quantityGrams: newQty, totalPrice: newPrice });
                        }}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Decrease quantity"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-gray-800 dark:text-gray-200 min-w-[56px] text-center select-none">
                        {item.quantityGrams >= 1000
                          ? `${(item.quantityGrams / 1000).toFixed(1)}k`
                          : `${item.quantityGrams}g`}
                      </span>
                      <button
                        onClick={() => {
                          playUiSound?.("click");
                          const step = item.quantityGrams >= 500 ? 250 : 100;
                          const newQty = item.quantityGrams + step;
                          const newPrice = Math.ceil((item.price_per_kg / 1000) * newQty);
                          onUpdateCartItem(item.id, { quantityGrams: newQty, totalPrice: newPrice });
                        }}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Increase quantity"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Total Price & Desktop Delete */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="text-right sm:min-w-[70px]">
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 sm:text-gray-900 sm:dark:text-white text-base sm:text-lg">
                          {formatCurrency(item.totalPrice)}
                        </span>
                      </div>

                      {/* Desktop Delete button */}
                      <button
                        onClick={() => {
                          playUiSound?.("delete");
                          onRemoveCartItem(item.id);
                        }}
                        className="hidden sm:inline-flex p-1.5 text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove item"
                        aria-label={`Remove ${item.product}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bill Summary Column */}
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-md">
            <h3 className="font-bold text-base text-gray-900 dark:text-white mb-4 flex items-center justify-between">
              <span>Receipt Summary</span>
              <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {cart.length} Items
              </span>
            </h3>

            {/* Optional Customer Name */}
            <div className="mb-4">
              <label className="block text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                Customer Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Bhai"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300 border-t border-b border-gray-100 dark:border-gray-700/80 py-3 mb-4">
              <div className="flex justify-between">
                <span>Total Items</span>
                <span className="font-semibold text-gray-900 dark:text-white">{totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Quantity / Weight</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatWeight(totalWeightGrams)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(rawSubtotal)}
                </span>
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-5">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Grand Total:
              </span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(grandTotal)}
              </span>
            </div>

            <button
              onClick={handleCheckoutComplete}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Complete & Print Receipt
            </button>
          </div>
        </div>
      </div>

      {/* Hidden printable receipt for clean window.print() output */}
      <div id="printable-receipt" className="hidden">
        <div style={{ maxWidth: "320px", margin: "0 auto", fontFamily: "monospace", fontSize: "12px", lineHeight: "1.4" }}>
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "bold", margin: "0" }}>GROCERY SHOP RECEIPT</h2>
            <p style={{ margin: "3px 0", fontSize: "10px" }}>{new Date().toLocaleString()}</p>
            {customerName && <p style={{ margin: "3px 0" }}>Customer: {customerName}</p>}
            <p style={{ margin: "5px 0" }}>--------------------------------</p>
          </div>

          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px dashed #000" }}>
                <th style={{ padding: "4px 0" }}>Item</th>
                <th style={{ padding: "4px 0", textAlign: "center" }}>Qty</th>
                <th style={{ padding: "4px 0", textAlign: "right" }}>Amt</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px dotted #ccc" }}>
                  <td style={{ padding: "4px 0" }}>{item.product}</td>
                  <td style={{ padding: "4px 0", textAlign: "center" }}>{formatWeight(item.quantityGrams)}</td>
                  <td style={{ padding: "4px 0", textAlign: "right" }}>{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "10px", borderTop: "1px dashed #000", paddingTop: "5px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Total Items:</span>
              <span>{cart.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Total Weight:</span>
              <span>{formatWeight(totalWeightGrams)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "bold", marginTop: "5px" }}>
              <span>GRAND TOTAL:</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "15px", fontSize: "10px" }}>
            <p>Thank you! Visit Again!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingBill;
