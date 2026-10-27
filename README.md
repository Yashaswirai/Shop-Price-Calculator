# Shop Price Calculator 🛒✨

![Shop Price Calculator](https://img.shields.io/badge/Shop%20Price-Calculator-brightgreen)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.7-38B2AC)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12.11.4-0055FF)

An ultra-interactive, modern web application for calculating prices and quantities for grocery shopping, managing product rates, building shopping bills, and generating printable shop receipts.

---

## 🌟 Enhanced Features & Interactivity

### 🧮 1. Real-Time Bidirectional Calculator
- **Instant Dual Calculation**: Type quantity (grams or kg) to instantly see the price in ₹, or type a budget in ₹ to calculate exact grams.
- **Unit Selector**: Switch between Grams (`g`) and Kilograms (`kg`).
- **Interactive Weight Slider**: Drag smoothly from 0g to 5,000g for real-time calculations.
- **Quick Preset Chips**:
  - Weight presets: `50g`, `100g`, `250g (Paav)`, `500g (Aadha Kilo)`, `1 kg`, `2 kg`, `5 kg`.
  - Rupee presets: `₹10`, `₹20`, `₹50`, `₹100`, `₹200`, `₹500`.
- **Live Rate Breakdown Card**: Prominently highlights total price, cost per 100g, and cost per gram.
- **One-Click Actions**:
  - **"Add to Shopping Bill"** with celebratory confetti animation.
  - **"Copy Result"** to clipboard for sharing.

### 📋 2. Interactive Product Catalog
- **Smart Category Filtering**: Filter across *Grains & Flours*, *Dals & Pulses*, *Oils & Ghee*, *Spices & Seasoning*, *Snacks & Sweets*, and *Other Essentials* with live counts.
- **Fast Instant Search**: Real-time fuzzy product search with instant clear button.
- **Flexible Sorting**: Sort alphabetically (A–Z, Z–A) or by Price (Low to High, High to Low).
- **View Switcher**: Toggle between responsive modern **Grid Cards** and compact **List View**.
- **Direct Card Actions**:
  - Click to instantly activate product in the calculator.
  - Dedicated **Edit** button on each card to update product details.
  - Dedicated **Delete** button with instant **Undo Toast Notification**.

### 🧾 3. Integrated Shopping Bill & Receipt
- **Itemized Bill**: Keeps track of items added from calculations with live weights and prices.
- **Inline Quantity Controls**: Quick `+` and `-` buttons to adjust weights directly on the bill.
- **Printable Shop Receipt**: Click "Print" to generate a clean, thermal/receipt-styled printable bill.
- **WhatsApp Sharing**: One-click "Share via WhatsApp" or copy formatted plain-text receipt.
- **Customer Name & Order Celebration**: Add customer name and finish with celebratory confetti.

### ⚖️ 4. Customary Indian Grocery Converter
- **Portion Table**: Instant cuts for customary Indian grocery portions (Paav, Aadha Kilo, Sava Kilo, Dedh Kilo, Dhaai Kilo, etc.).
- **Multi-Unit Converter**: Convert between Grams, Kilograms, Quintals, Pounds, and Ounces.

### 🎨 5. Delightful UX & Accessibility
- **Dark Mode & Light Mode**: Toggle themes with smooth transitions and saved preferences.
- **Synthesized Audio Feedback**: Subtle, non-intrusive sound cues for clicks, item selection, cart adds, and deletes using the native Web Audio API (can be muted anytime).
- **Toast Notifications**: Non-blocking toast alerts with instant Undo action.
- **Data Persistence**: Automatic browser `localStorage` synchronization for products, carts, theme, and sound settings.
- **Catalog Reset**: One-click restore to default standard grocery prices anytime.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

---

## 🛠️ Tech Stack

- **React 19**
- **Tailwind CSS v4**
- **Framer Motion**
- **Lucide Icons**
- **Canvas Confetti**
- **Web Audio API**
- **Vite**

---

## 📄 License

This project is licensed under the MIT License.
