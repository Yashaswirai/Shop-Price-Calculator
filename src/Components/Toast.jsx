import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from "lucide-react";

const Toast = ({ toasts, onDismiss, onUndo }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";
          const isInfo = toast.type === "info";

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-2xl border backdrop-blur-md ${
                isSuccess
                  ? "bg-emerald-950/90 text-emerald-100 border-emerald-500/40 shadow-emerald-900/20"
                  : isError
                  ? "bg-rose-950/90 text-rose-100 border-rose-500/40 shadow-rose-900/20"
                  : "bg-gray-900/90 text-gray-100 border-gray-700/60 shadow-black/40"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 mr-2">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                {isInfo && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
                <p className="text-sm font-medium leading-tight truncate">{toast.message}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {toast.undoAction && onUndo && (
                  <button
                    onClick={() => {
                      onUndo(toast);
                      onDismiss(toast.id);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Undo
                  </button>
                )}
                <button
                  onClick={() => onDismiss(toast.id)}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10 cursor-pointer"
                  aria-label="Dismiss toast"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
