import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Products from "./Products";
import Calculation from "./Calculation";
import AddProduct from "./AddProduct";

const Search = () => {
  // Default product list to use if localStorage is empty
  const defaultProductList = [
    { product: "Aata", price_per_kg: 38 },
    { product: "Maida", price_per_kg: 40 },
    { product: "Moong Dal", price_per_kg: 120 },
    { product: "Chawal(red)", price_per_kg: 42 },
    { product: "Chawal(blue)", price_per_kg: 58 },
    { product: "Moong & Masoor Mix", price_per_kg: 120 },
    { product: "Masoor Dal", price_per_kg: 110 },
    { product: "Chana Dal", price_per_kg: 100 },
    { product: "Rahar Dal", price_per_kg: 130 },
    { product: "Barri", price_per_kg: 144 },
    { product: "Chini", price_per_kg: 50 },
    { product: "S. Oil (Soybean)", price_per_kg: 180 },
    { product: "R. Oil (Refined)", price_per_kg: 170 },
    { product: "Pasta", price_per_kg: 83 },
    { product: "Jeera", price_per_kg: 500 },
    { product: "Chowmin Big pkt", price_per_kg: 35 },
    { product: "Chowmin Small pkt", price_per_kg: 5 },
    { product: "Lachidana", price_per_kg: 71 },
    { product: "Satu Big (Pkt)", price_per_kg: 35 },
    { product: "Satu Small(Pkt)", price_per_kg: 18 },
    { product: "Chana", price_per_kg: 85 },
    { product: "Sukhal Marcha", price_per_kg: 333 },
    { product: "Khabar Soda", price_per_kg: 80 },
    { product: "Telhan", price_per_kg: 125 },
    { product: "Sarso", price_per_kg: 120 },
    { product: "Muri", price_per_kg: 62 },
    { product: "Jawain Mangrail", price_per_kg: 333 },
    { product: "Badam", price_per_kg: 160 },
    { product: "Aachar", price_per_kg: 100 },
    { product: "Batasa", price_per_kg: 83 },
    { product: "Meetha", price_per_kg: 62 },
  ];

  // Initialize state with an empty array, will be populated in useEffect
  const [productList, setProductList] = useState([]);
  const [value, setValue] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [calculation, setCalculation] = useState({});

  // Load products from localStorage on component mount
  useEffect(() => {
    try {
      // Try to get products from localStorage
      const storedProducts = localStorage.getItem('productList');

      if (storedProducts) {
        // If products exist in localStorage, use them
        setProductList(JSON.parse(storedProducts));
      } else {
        // If no products in localStorage, use default list and save it
        setProductList(defaultProductList);
        localStorage.setItem('productList', JSON.stringify(defaultProductList));
      }
    } catch (error) {
      // If there's an error (e.g., localStorage not available), use default list
      console.error('Error accessing localStorage:', error);
      setProductList(defaultProductList);
    }
  }, []);

  // Save products to localStorage whenever the list changes
  useEffect(() => {
    // Only save if productList is not empty (to avoid overwriting on initial render)
    if (productList.length > 0) {
      try {
        localStorage.setItem('productList', JSON.stringify(productList));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [productList]);
  const submitHandler = (e) => {
    e.preventDefault();

    // Convert inputs to numbers
    const priceNum = price === "" ? 0 : Number(price);
    const quantityNum = quantity === "" ? 0 : Number(quantity);

    // Find the selected product
    const commodity = productList.find((item) => item.product === value);

    if (!commodity) {
      console.error("Product not found");
      return;
    }

    const pricePerKg = commodity.price_per_kg;
    let calculatedTotal = 0;
    let calculatedWeight = 0;

    // Calculate based on which input was provided
    if (priceNum > 0 && quantityNum === 0) {
      // If price is provided but not quantity
      calculatedWeight = Math.floor((1000 / pricePerKg) * priceNum);
      calculatedTotal = priceNum;
    } else if (quantityNum > 0 && priceNum === 0) {
      // If quantity is provided but not price
      calculatedTotal = Math.ceil((pricePerKg / 1000) * quantityNum);
      calculatedWeight = quantityNum;
    } else if (priceNum > 0 && quantityNum > 0) {
      // If both are provided, prioritize quantity calculation
      calculatedTotal = Math.ceil((pricePerKg / 1000) * quantityNum);
      calculatedWeight = quantityNum;
    }

    // Update calculation state for display
    setCalculation({
      product: commodity.product,
      pricePerKg: pricePerKg,
      price: calculatedTotal,
      quantity: calculatedWeight,
    });

    // Reset form inputs
    setValue("");
    setPrice("");
    setQuantity("");
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/70 backdrop-blur-md rounded-xl shadow-xl p-6 mb-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          Search & Calculate
        </h2>

        <form className="space-y-6" onSubmit={(e) => submitHandler(e)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Product Search Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Product Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search for a product"
                  value={value}
                  required
                  onChange={(e) => setValue(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Quantity Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Quantity (grams)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200"
                />
              </div>
              <p className="text-xs text-gray-400">Leave empty to calculate based on price</p>
            </div>

            {/* Price Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Price (₹)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                />
              </div>
              <p className="text-xs text-gray-400">Leave empty to calculate based on quantity</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg shadow-lg hover:shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200"
          >
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Calculate
            </div>
          </motion.button>
        </form>
      </motion.div>

      <AddProduct
        productList={productList}
        onAddProduct={(newProduct) => {
          if (newProduct.isUpdate) {
            // Update existing product price
            const updatedList = productList.map(item =>
              item.product.toLowerCase() === newProduct.product.toLowerCase()
                ? { ...item, price_per_kg: newProduct.price_per_kg }
                : item
            );
            setProductList(updatedList);
          } else {
            // Check if product with same name already exists (fallback check)
            const exists = productList.some(
              item => item.product.toLowerCase() === newProduct.product.toLowerCase()
            );

            if (exists) {
              alert(`Product "${newProduct.product}" already exists! Use the update feature to change its price.`);
              return;
            }

            // Add the new product to the list
            setProductList([...productList, newProduct]);
          }
        }}
      />

      <Products val={value} setval={setValue} list={productList} />
      <Calculation calc={calculation} />
    </motion.div>
  );
};

export default Search;
