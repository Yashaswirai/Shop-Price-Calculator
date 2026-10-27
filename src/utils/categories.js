export const CATEGORIES = [
  { id: "all", name: "All Products", icon: "LayoutGrid" },
  { id: "Grains & Flours", name: "Grains & Flours", icon: "Wheat" },
  { id: "Dals & Pulses", name: "Dals & Pulses", icon: "Coins" },
  { id: "Oils & Ghee", name: "Oils & Ghee", icon: "Droplet" },
  { id: "Spices & Seasoning", name: "Spices & Seasoning", icon: "Flame" },
  { id: "Snacks & Sweets", name: "Snacks & Sweets", icon: "Cookie" },
  { id: "Other Essentials", name: "Other Essentials", icon: "Package" },
];

const categoryKeywords = {
  "Grains & Flours": ["aata", "maida", "chawal", "rice", "satu", "sooji", "suji", "besan", "wheat", "flour"],
  "Dals & Pulses": ["dal", "daal", "moong", "masoor", "chana", "rahar", "arhar", "urad", "rajma", "pulse", "lentil"],
  "Oils & Ghee": ["oil", "ghee", "sarso", "mustard", "telhan", "refined", "soybean", "butter"],
  "Spices & Seasoning": ["jeera", "marcha", "mirch", "chili", "jawain", "mangrail", "haldi", "turmeric", "dhaniya", "salt", "spice"],
  "Snacks & Sweets": ["chini", "sugar", "badam", "almond", "kaju", "muri", "chowmin", "noodle", "pasta", "barri", "batasa", "meetha", "lachidana", "aachar", "pickle", "biscuit", "sweet", "snack"],
};

export const getCategoryForProduct = (productName = "") => {
  const lowerName = productName.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => lowerName.includes(keyword))) {
      return category;
    }
  }
  return "Other Essentials";
};

export const getCategoryBadgeStyle = (category = "") => {
  const styles = {
    "Grains & Flours": "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30",
    "Dals & Pulses": "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
    "Oils & Ghee": "bg-yellow-500/15 text-yellow-600 dark:text-yellow-300 border-yellow-500/30",
    "Spices & Seasoning": "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30",
    "Snacks & Sweets": "bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30",
    "Other Essentials": "bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30",
  };
  return styles[category] || "bg-gray-500/15 text-gray-600 dark:text-gray-300 border-gray-500/30";
};
