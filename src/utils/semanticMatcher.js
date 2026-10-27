/**
 * Semantic Matcher for Grocery Products
 * Maps multilingual, English, Hindi, and transliterated grocery names to catalogue entries.
 */

// Comprehensive dictionary of synonyms and semantic equivalents
export const SEMANTIC_DICTIONARY = {
  // Grains & Flours
  "aata": ["flour", "wheat flour", "atta", "gehu ka aata", "chakki aata", "whole wheat flour", "gehun"],
  "maida": ["all purpose flour", "refined flour", "white flour", "plain flour"],
  "chawal(red)": ["red rice", "lal chawal", "matta rice", "brown rice", "raw rice red"],
  "chawal(blue)": ["basmati rice", "white rice", "steam rice", "blue rice", "rice", "chawal", "chawal(white)"],
  "satu big (pkt)": ["sattu big", "roasted gram flour large", "sattu packet big", "sattu pack 1kg"],
  "satu small(pkt)": ["sattu small", "roasted gram flour small", "sattu packet small", "sattu pack 500g"],

  // Dals & Pulses
  "moong dal": ["yellow lentil", "yellow moong", "split green gram", "dhuli moong", "mung dal"],
  "masoor dal": ["red lentil", "pink lentil", "masur dal", "malka masoor", "split red lentil"],
  "chana dal": ["split chickpeas", "bengal gram", "split chana", "gram dal"],
  "rahar dal": ["toor dal", "arhar dal", "tur dal", "pigeon pea", "yellow pigeon pea"],
  "moong & masoor mix": ["mix dal", "moong masoor mix", "mixed lentils", "panchratna dal"],
  "chana": ["chickpeas", "kala chana", "black chickpeas", "brown chana", "garbanzo"],

  // Oils & Ghee
  "s. oil (soybean)": ["soybean oil", "soya oil", "soy oil", "fortune soybean", "refined soybean oil"],
  "r. oil (refined)": ["refined oil", "sunflower oil", "cooking oil", "vegetable oil", "canola oil"],
  "sarso": ["mustard seeds", "sarson", "black mustard", "rai", "mustard seed"],
  "telhan": ["oilseeds", "sesame seeds", "til", "flaxseeds", "alsi", "oil seed"],

  // Spices & Seasoning
  "jeera": ["cumin", "cumin seeds", "zeera", "white cumin", "sabut jeera"],
  "sukhal marcha": ["dry red chilli", "red chili", "dry red chili", "lal mirch", "sabut mirch"],
  "jawain mangrail": ["ajwain kalonji", "carom seeds and nigella seeds", "ajwain", "carom seeds", "kalonji", "nigella"],
  "khabar soda": ["baking soda", "meetha soda", "sodium bicarbonate", "cooking soda"],

  // Snacks & Sweets
  "chini": ["sugar", "white sugar", "cane sugar", "cheeni", "crystal sugar"],
  "pasta": ["macaroni", "penne pasta", "fusilli", "wheat pasta"],
  "chowmin big pkt": ["noodles big", "hakka noodles large", "chowmein big", "chowmin large pack"],
  "chowmin small pkt": ["noodles small", "hakka noodles small", "chowmein small", "chowmin packet"],
  "barri": ["mangodi", "badi", "soya chunks", "urad dal badi", "moong badi"],
  "badam": ["almonds", "almond", "badam giri", "california almonds"],
  "aachar": ["pickle", "mango pickle", "mixed pickle", "aam ka achar", "achar"],
  "batasa": ["batasha", "sugar candy", "sugar drops", "patasa"],
  "meetha": ["jaggery", "gur", "gud", "brown sugar", "cane jaggery"],
  "muri": ["puffed rice", "murmura", "kurmura", "mamra", "bhel muri"],
  "lachidana": ["dana", "sugar coated drops", "lachhidana", "nakul dana"],
};

/**
 * Clean and normalize a string for comparison
 */
const cleanString = (str = "") => {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Calculate simple Token Dice/Jaccard similarity between two strings
 */
const calculateSimilarity = (strA, strB) => {
  const wordsA = new Set(cleanString(strA).split(" ").filter(Boolean));
  const wordsB = new Set(cleanString(strB).split(" ").filter(Boolean));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection++;
  }

  const union = new Set([...wordsA, ...wordsB]).size;
  return intersection / union;
};

/**
 * Find semantic match for a detected product name against the catalogue
 * @param {string} detectedName - Name extracted from document/image
 * @param {Array} catalogue - List of catalogue items [{ product, price_per_kg, ... }]
 * @returns {Object} { matchedProduct, confidence: 'high'|'medium'|'none', reason }
 */
export const findSemanticMatch = (detectedName = "", catalogue = []) => {
  if (!detectedName || !catalogue || catalogue.length === 0) {
    return { matchedProduct: null, confidence: "none", reason: "No catalogue or name provided" };
  }

  const cleanDetected = cleanString(detectedName);

  // 1. Exact match (case-insensitive)
  const exactMatch = catalogue.find(
    (item) => cleanString(item.product) === cleanDetected
  );
  if (exactMatch) {
    return {
      matchedProduct: exactMatch,
      confidence: "high",
      reason: `Exact name match with "${exactMatch.product}"`,
    };
  }

  // 2. Direct Substring Match
  const subMatch = catalogue.find((item) => {
    const cleanItem = cleanString(item.product);
    return cleanDetected === cleanItem || cleanDetected.includes(cleanItem) || cleanItem.includes(cleanDetected);
  });
  if (subMatch && Math.abs(cleanDetected.length - cleanString(subMatch.product).length) < 5) {
    return {
      matchedProduct: subMatch,
      confidence: "high",
      reason: `Direct keyword match with "${subMatch.product}"`,
    };
  }

  // 3. Synonym / Dictionary matching
  for (const [key, synonyms] of Object.entries(SEMANTIC_DICTIONARY)) {
    // Check if detected name matches key or any synonyms
    const matchesKey = cleanDetected.includes(key) || key.includes(cleanDetected);
    const matchesSynonym = synonyms.some(
      (syn) => cleanDetected.includes(syn) || syn.includes(cleanDetected)
    );

    if (matchesKey || matchesSynonym) {
      // Find matching item in catalogue for this dictionary entry
      const catalogueItem = catalogue.find((item) => {
        const itemClean = cleanString(item.product);
        return (
          itemClean.includes(key) ||
          key.includes(itemClean) ||
          synonyms.some((s) => itemClean.includes(s) || s.includes(itemClean))
        );
      });

      if (catalogueItem) {
        return {
          matchedProduct: catalogueItem,
          confidence: "high",
          reason: `AI Synonym match: "${detectedName}" recognized as "${catalogueItem.product}"`,
        };
      }
    }
  }

  // 4. Fuzzy Token Similarity
  let bestMatch = null;
  let highestScore = 0;

  for (const item of catalogue) {
    const score = calculateSimilarity(detectedName, item.product);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore >= 0.5) {
    return {
      matchedProduct: bestMatch,
      confidence: highestScore >= 0.7 ? "high" : "medium",
      reason: `High phonetic/token similarity (${Math.round(highestScore * 100)}%) with "${bestMatch.product}"`,
    };
  }

  // No match found -> This is a new product!
  return {
    matchedProduct: null,
    confidence: "none",
    reason: "New product not found in catalogue",
  };
};
