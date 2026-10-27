import { useState, useEffect } from "react";
import Navbar from "./Components/Navbar";
import Search from "./Components/Search";
import { playSound } from "./utils/audio";

const App = () => {
  // Dark mode state with localStorage persistence
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) return savedTheme === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return true;
    }
  });

  // Sound effects state with localStorage persistence
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const savedSound = localStorage.getItem("soundEnabled");
      return savedSound !== null ? savedSound === "true" : true;
    } catch {
      return true;
    }
  });

  // Active tab state: "calculator" | "bill" | "converter"
  const [activeTab, setActiveTab] = useState("calculator");

  // AI Scanner modal state
  const [isAiScannerOpen, setIsAiScannerOpen] = useState(false);

  // Cart summary for navbar badge
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  // Sync theme to <html> tag class list
  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    } catch (err) {
      console.error(err);
    }
  }, [darkMode]);

  // Sync sound preference
  useEffect(() => {
    try {
      localStorage.setItem("soundEnabled", String(soundEnabled));
    } catch (err) {
      console.error(err);
    }
  }, [soundEnabled]);

  // Periodically update cart badge from localStorage
  useEffect(() => {
    const updateCartStats = () => {
      try {
        const storedCart = localStorage.getItem("shopCart");
        if (storedCart) {
          const parsed = JSON.parse(storedCart);
          if (Array.isArray(parsed)) {
            setCartCount(parsed.length);
            const sum = parsed.reduce((acc, item) => acc + Math.ceil(item.totalPrice || 0), 0);
            setCartTotal(Math.ceil(sum));
            return;
          }
        }
        setCartCount(0);
        setCartTotal(0);
      } catch {
        setCartCount(0);
        setCartTotal(0);
      }
    };

    updateCartStats();
    const interval = setInterval(updateCartStats, 800);
    return () => clearInterval(interval);
  }, []);

  const handleResetCatalog = () => {
    if (typeof window.__shopResetCatalog === "function") {
      window.__shopResetCatalog();
    }
  };

  const playUiSound = (type, force = false) => {
    playSound(type, force || soundEnabled);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? "dark bg-gray-900 text-gray-100" : "bg-slate-50 text-slate-800"}`}>
      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-40 dark:opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] z-0" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          cartCount={cartCount}
          cartTotal={cartTotal}
          onOpenCart={() => setActiveTab("bill")}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          onResetCatalog={handleResetCatalog}
          onOpenAiScanner={() => setIsAiScannerOpen(true)}
          playUiSound={playUiSound}
        />

        {/* Main Content Area */}
        <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-6xl">
          <Search
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            soundEnabled={soundEnabled}
            isAiScannerOpen={isAiScannerOpen}
            setIsAiScannerOpen={setIsAiScannerOpen}
          />
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800/80 py-6 text-center text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-6xl">
            <p>
              © {new Date().getFullYear()} <b className="text-emerald-600 dark:text-emerald-400">Shop Price Calculator</b>. Built for fast grocery calculations & smart shopping.
            </p>
            <div className="flex items-center gap-4 text-gray-400 text-[11px]">
              <span>Real-time Sync</span>
              <span>•</span>
              <span>Offline Ready (LocalStorage)</span>
              <span>•</span>
              <span>Printable Receipts</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
