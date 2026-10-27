import { findSemanticMatch } from "../utils/semanticMatcher.js";
import { getCategoryForProduct } from "../utils/categories.js";

/**
 * Convert a File object to base64 data string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Built-in Sample Invoices for Instant Testing
 */
export const SAMPLE_DOCUMENTS = [
  {
    id: "sample_grocery_bill",
    name: "Sample Grocery Wholesale Bill",
    desc: "Contains Flour, Sugar, Cumin, Mustard Oil, and new items like Tea (Chai) and Turmeric (Haldi)",
    items: [
      { detected_name: "Wheat Flour (Chakki)", price_per_kg: 42, detected_qty: "1 kg", category: "Grains & Flours" },
      { detected_name: "Refined White Sugar", price_per_kg: 54, detected_qty: "1 kg", category: "Snacks & Sweets" },
      { detected_name: "Whole Cumin Seeds", price_per_kg: 520, detected_qty: "1 kg", category: "Spices & Seasoning" },
      { detected_name: "Pure Mustard Oil", price_per_kg: 185, detected_qty: "1 Litre", category: "Oils & Ghee" },
      { detected_name: "Red Lentils (Masoor)", price_per_kg: 115, detected_qty: "1 kg", category: "Dals & Pulses" },
      { detected_name: "Turmeric Powder (Haldi)", price_per_kg: 240, detected_qty: "500g", category: "Spices & Seasoning" },
      { detected_name: "Premium Assam Tea", price_per_kg: 360, detected_qty: "250g", category: "Other Essentials" },
    ],
  },
  {
    id: "sample_supermarket_receipt",
    name: "Sample Supermarket Receipt",
    desc: "Contains All Purpose Flour, Basmati Rice, Toor Dal, Almonds, and Green Cardamom",
    items: [
      { detected_name: "All Purpose Flour", price_per_kg: 45, detected_qty: "1 kg", category: "Grains & Flours" },
      { detected_name: "Basmati Rice Premium", price_per_kg: 62, detected_qty: "1 kg", category: "Grains & Flours" },
      { detected_name: "Yellow Pigeon Pea (Toor Dal)", price_per_kg: 135, detected_qty: "1 kg", category: "Dals & Pulses" },
      { detected_name: "California Almonds", price_per_kg: 175, detected_qty: "500g", category: "Snacks & Sweets" },
      { detected_name: "Green Cardamom (Elaichi)", price_per_kg: 2200, detected_qty: "100g", category: "Spices & Seasoning" },
    ],
  },
];

/**
 * Preferred ranking order of Gemini models for multimodal OCR & extraction
 */
export const PREFERRED_MODEL_ORDER = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-002",
  "gemini-1.5-flash-001",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-2.5-pro",
  "gemini-2.0-pro-exp",
  "gemini-1.5-pro-latest",
  "gemini-1.5-pro",
];

/**
 * Fallback candidate models if ModelService.ListModels is unavailable or restricted
 */
export const FALLBACK_MODEL_CANDIDATES = [
  "models/gemini-2.0-flash",
  "models/gemini-2.5-flash",
  "models/gemini-1.5-flash-latest",
  "models/gemini-1.5-flash",
  "models/gemini-1.5-pro",
];

/**
 * Format model name into a standard resource path (e.g. models/gemini-2.0-flash)
 */
export const formatModelPath = (modelName) => {
  if (!modelName) return "models/gemini-2.0-flash";
  return modelName.startsWith("models/") ? modelName : `models/${modelName}`;
};

/**
 * Filter and sort available models by multimodal & content generation performance
 */
export const rankGeminiModels = (models = []) => {
  const contentModels = models.filter(
    (m) =>
      Array.isArray(m.supportedGenerationMethods) &&
      m.supportedGenerationMethods.includes("generateContent")
  );

  return contentModels.sort((a, b) => {
    const aId = (a.name || "").replace(/^models\//, "").toLowerCase();
    const bId = (b.name || "").replace(/^models\//, "").toLowerCase();

    const aIndex = PREFERRED_MODEL_ORDER.findIndex((p) => aId.includes(p.toLowerCase()));
    const bIndex = PREFERRED_MODEL_ORDER.findIndex((p) => bId.includes(p.toLowerCase()));

    const aRank = aIndex === -1 ? 999 : aIndex;
    const bRank = bIndex === -1 ? 999 : bIndex;

    if (aRank === bRank && aRank === 999) {
      const aIsFlash = aId.includes("flash");
      const bIsFlash = bId.includes("flash");
      if (aIsFlash && !bIsFlash) return -1;
      if (!aIsFlash && bIsFlash) return 1;
      return aId.localeCompare(bId);
    }

    return aRank - bRank;
  });
};

/**
 * Query Google Gemini ModelService to list available models for an API key
 * @param {string} apiKey - Google Gemini API Key
 * @returns {Promise<{ models: Array, recommendedModel: string }>}
 */
export const fetchAvailableGeminiModels = async (apiKey) => {
  if (!apiKey) {
    throw new Error("Gemini API key is required to check available models.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData?.error?.message ||
      `Failed to list models from Gemini API (HTTP ${response.status}).`;
    throw new Error(message);
  }

  const data = await response.json();
  const rawModels = data.models || [];
  const ranked = rankGeminiModels(rawModels);

  if (ranked.length === 0) {
    throw new Error("No Gemini models supporting 'generateContent' were found for this API key.");
  }

  return {
    models: ranked.map((m) => ({
      id: m.name,
      displayName: m.displayName || m.name.replace(/^models\//, ""),
      description: m.description || "",
      supportedMethods: m.supportedGenerationMethods || [],
    })),
    recommendedModel: ranked[0].name,
  };
};

/**
 * Execute generateContent API call for a specific model
 */
export const callGeminiGenerateContent = async (modelPath, apiKey, requestBody) => {
  const cleanPath = formatModelPath(modelPath);
  const url = `https://generativelanguage.googleapis.com/v1beta/${cleanPath}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `API request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.model = cleanPath;
    throw error;
  }

  return response.json();
};

/**
 * Scan document using Google Gemini Vision API with dynamic model discovery and fallback
 * @param {string} base64Data - Base64 Data URL of the image
 * @param {Array} catalogue - Current catalogue product list
 * @param {string} apiKey - Gemini API Key
 * @param {string} preferredModel - Optional preferred model name or "auto"
 * @param {Function} onStatusUpdate - Status update callback
 * @returns {Promise<Array>} Extracted and matched items (with usedModel property)
 */
export const scanWithGemini = async (
  base64Data,
  catalogue = [],
  apiKey = "",
  preferredModel = "auto",
  onStatusUpdate = null
) => {
  if (!apiKey) {
    throw new Error("Gemini API key is required. Please provide a key in AI Settings.");
  }

  // Extract base64 and mime type
  const mimeMatch = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!mimeMatch) {
    throw new Error("Invalid image format. Please upload a valid image (PNG, JPG, WEBP).");
  }

  const mimeType = mimeMatch[1];
  const base64Content = mimeMatch[2];

  // Prepare catalogue summary for semantic prompt
  const catalogueSummary = catalogue.map((item) => ({
    product: item.product,
    price_per_kg: item.price_per_kg,
    category: item.category || getCategoryForProduct(item.product),
  }));

  const systemPrompt = `You are an expert AI OCR & Grocery Document Reader.
Analyze this uploaded document/photo (which could be a grocery receipt, supermarket invoice, price list, wholesale rate board, shelf tag, or handwritten note).
Your task is to:
1. Extract all product items and their rates per kilogram.
   - If a price is for a fractional weight (e.g. 500g for 25, or 250g for 30), normalize the price to price per kg (e.g. 500g @ 25 = 50 per kg).
   - Always round price_per_kg up to the next whole rupee (ceiling value, no decimals).
2. Compare each extracted product with our existing catalogue:
   ${JSON.stringify(catalogueSummary)}
3. Perform intelligent semantic matching!
   - Recognise linguistic, transliteration, and semantic equivalents.
   - For example:
     - "Flour" or "Wheat Flour" or "Atta" -> matches catalogue entry "Aata".
     - "All Purpose Flour" -> matches "Maida".
     - "Rice" or "Basmati Rice" -> matches "Chawal(blue)" or "Chawal(red)".
     - "Sugar" or "White Sugar" -> matches "Chini".
     - "Cumin" or "Cumin Seeds" -> matches "Jeera".
     - "Mustard" or "Mustard Seeds" -> matches "Sarso".
     - "Red Lentil" or "Pink Lentil" -> matches "Masoor Dal".
     - "Toor Dal" or "Arhar Dal" -> matches "Rahar Dal".
     - "Yellow Lentil" or "Split Moong" -> matches "Moong Dal".
     - "Soybean Oil" -> matches "S. Oil (Soybean)".
     - "Refined Cooking Oil" -> matches "R. Oil (Refined)".
     - "Almonds" -> matches "Badam".
   - If a product does NOT match any catalogue entry, set matched_catalogue_product to null (it will be added as a new entry).

Output strict JSON only, without any markdown formatting, backticks, or extra commentary.
The JSON must be an array of objects with the following structure:
[
  {
    "detected_name": "Product name as written on receipt",
    "matched_catalogue_product": "Exact existing catalogue name if matched, else null",
    "match_confidence": "high" | "medium" | "none",
    "match_reason": "Brief explanation of why it matched or why it is new",
    "price_per_kg": 45,
    "category": "Grains & Flours"
  }
]`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: systemPrompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Content,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      response_mime_type: "application/json",
    },
  };

  // Determine candidate models
  let candidateModels = [];

  // 1. If preferredModel is specified and not "auto", try that first
  if (preferredModel && preferredModel !== "auto") {
    candidateModels.push(formatModelPath(preferredModel));
  }

  // 2. Query available models dynamically from ModelService.ListModels
  onStatusUpdate?.("Checking available models for your API key...");
  try {
    const modelInfo = await fetchAvailableGeminiModels(apiKey);
    const discoveredIds = modelInfo.models.map((m) => m.id);
    for (const id of discoveredIds) {
      if (!candidateModels.includes(id)) {
        candidateModels.push(id);
      }
    }
  } catch (listErr) {
    console.warn("ModelService list models check skipped/failed, using fallback candidates:", listErr);
    for (const fb of FALLBACK_MODEL_CANDIDATES) {
      if (!candidateModels.includes(fb)) {
        candidateModels.push(fb);
      }
    }
  }

  // Ensure candidate models exist
  if (candidateModels.length === 0) {
    candidateModels = [...FALLBACK_MODEL_CANDIDATES];
  }

  let lastError = null;
  let rawText = null;
  let successfulModel = null;

  // Try candidate models in order
  for (let i = 0; i < candidateModels.length; i++) {
    const currentModel = candidateModels[i];
    const friendlyName = currentModel.replace(/^models\//, "");

    onStatusUpdate?.(
      i === 0
        ? `Extracting items using ${friendlyName}...`
        : `Switching to supported model: ${friendlyName}...`
    );

    try {
      const result = await callGeminiGenerateContent(currentModel, apiKey, requestBody);
      rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      successfulModel = currentModel;
      break;
    } catch (err) {
      lastError = err;
      const isModelNotFoundError =
        err.status === 404 ||
        /not found|not supported for generatecontent|modelservice\.listmodels/i.test(err.message);

      if (isModelNotFoundError && i < candidateModels.length - 1) {
        console.warn(`Model ${currentModel} not supported for generateContent. Trying next candidate...`);
        continue;
      }

      // If it's an authorization/quota error, stop early and throw
      if (err.status === 400 || err.status === 401 || err.status === 403) {
        throw err;
      }
    }
  }

  if (!rawText) {
    if (lastError) throw lastError;
    throw new Error("No readable text or products detected in the uploaded image.");
  }

  // Parse JSON response safely
  let items = [];
  try {
    const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    items = JSON.parse(cleaned);
  } catch {
    throw new Error("Could not parse AI response into structured product data.");
  }

  // Post-process & guarantee semantic verification with local matcher
  const normalized = normalizeScannedItems(items, catalogue);
  normalized.usedModel = successfulModel;
  return normalized;
};

/**
 * Scan sample or simulate local extraction with intelligent semantic matcher
 */
export const scanSampleDocument = async (sampleId, catalogue = []) => {
  const sample = SAMPLE_DOCUMENTS.find((s) => s.id === sampleId) || SAMPLE_DOCUMENTS[0];
  // Simulate brief scanning delay for delightful UX
  await new Promise((resolve) => setTimeout(resolve, 800));

  const items = sample.items.map((item) => ({
    detected_name: item.detected_name,
    price_per_kg: Math.ceil(item.price_per_kg),
    category: item.category,
  }));

  const normalized = normalizeScannedItems(items, catalogue);
  normalized.usedModel = "sample-simulation";
  return normalized;
};

/**
 * Normalize scanned items and correlate with existing catalogue entries
 */
export const normalizeScannedItems = (items = [], catalogue = []) => {
  return items.map((item, index) => {
    const detectedName = item.detected_name || `Scanned Item #${index + 1}`;
    const pricePerKg = Math.ceil(Number(item.price_per_kg) || 0);

    // If Gemini already matched, verify against catalogue
    let matchedProduct = null;
    let confidence = item.match_confidence || "none";
    let reason = item.match_reason || "";

    if (item.matched_catalogue_product) {
      matchedProduct = catalogue.find(
        (p) => p.product.toLowerCase() === item.matched_catalogue_product.toLowerCase()
      );
    }

    // Run local semantic matcher to verify or find match if Gemini didn't find one
    if (!matchedProduct) {
      const matchResult = findSemanticMatch(detectedName, catalogue);
      matchedProduct = matchResult.matchedProduct;
      confidence = matchResult.confidence;
      reason = matchResult.reason;
    }

    const category =
      item.category ||
      (matchedProduct ? matchedProduct.category : getCategoryForProduct(detectedName));

    const isExisting = Boolean(matchedProduct);
    const oldPrice = isExisting ? matchedProduct.price_per_kg : null;
    const priceDiff = isExisting ? pricePerKg - oldPrice : 0;

    return {
      id: `scan-${Date.now()}-${index}`,
      selected: true,
      detected_name: detectedName,
      target_product_name: isExisting ? matchedProduct.product : detectedName,
      matched_product: matchedProduct,
      is_new: !isExisting,
      confidence,
      reason,
      price_per_kg: pricePerKg,
      old_price: oldPrice,
      price_diff: priceDiff,
      category,
    };
  });
};
