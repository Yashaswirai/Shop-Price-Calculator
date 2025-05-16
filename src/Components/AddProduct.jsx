import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AddProduct = ({ onAddProduct }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!productName.trim()) {
      setError("Product name is required");
      return;
    }
    
    const price = Number(pricePerKg);
    if (isNaN(price) || price <= 0) {
      setError("Price must be a positive number");
      return;
    }
    
    // Add the new product
    onAddProduct({
      product: productName.trim(),
      price_per_kg: price
    });
    
    // Reset form
    setProductName("");
    setPricePerKg("");
    setError("");
    setIsOpen(false);
  };

  return (
    <div className="mt-4 mb-2">
      {!isOpen ? (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg shadow-lg hover:shadow-blue-500/20 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Product
        </motion.button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800/70 backdrop-blur-md rounded-xl shadow-xl p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Add New Product</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 p-2 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm"
              >
                {error}
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Price Per Kg (₹)
                </label>
                <input
                  type="text"
                  value={pricePerKg}
                  onChange={(e) => setPricePerKg(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter price per kg"
                />
              </div>
              
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white font-medium rounded-lg shadow-lg hover:shadow-green-500/20 focus:outline-none"
                >
                  Add Product
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-700 text-white font-medium rounded-lg shadow-lg hover:bg-gray-600 focus:outline-none"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default AddProduct;
