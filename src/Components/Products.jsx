import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Products = ({ val, setval, list, onDeleteProduct }) => {
  const [filteredProduct, setFilteredProduct] = useState(list);

  useEffect(() => {
    if (!list || list.length === 0) {
      setFilteredProduct([]);
    } else {
      setFilteredProduct(
        list.filter((item) =>
          item.product.toLowerCase().includes(val.toLowerCase())
        )
      );
    }
  }, [val, list]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleDeleteProduct = (e, productName) => {
    e.stopPropagation(); // Prevent the click from selecting the product
    onDeleteProduct(productName);
  };

  return (
    <motion.div
      className="w-full mt-4 max-h-[300px] overflow-y-auto overflow-x-hidden rounded-lg bg-gray-800/50 p-2 backdrop-blur-sm no-scrollbar"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <h3 className="text-lg font-medium text-white mb-2 px-2">
        {val ? `Search results for "${val}"` : "All Products"}
      </h3>

      <AnimatePresence>
        {filteredProduct && filteredProduct.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {filteredProduct.map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-green-600/80 to-green-500/80 rounded-lg p-3 cursor-pointer shadow-md relative group"
                onClick={() => setval(item.product)}
              >
                <div className="flex justify-between items-center flex-wrap">
                  <div className="flex items-center min-w-0 mr-2">
                    <div className="h-8 w-8 flex-shrink-0 rounded-full bg-green-800 flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-white font-medium truncate">
                      {item.product}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-green-800/50 px-3 py-1 rounded-full flex-shrink-0">
                      <p className="text-white font-semibold">
                        ₹{item.price_per_kg}
                      </p>
                      <p className="text-xs text-green-200">per kg</p>
                    </div>
                    {/* Delete Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleDeleteProduct(e, item.product)}
                      className="opacity-100 bg-red-600 text-white p-2 rounded-full shadow-lg"
                      title={`Delete ${item.product}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
                          clipRule="evenodd"
                        />
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-32 bg-gray-700/30 rounded-lg"
          >
            {val ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-gray-500 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-center text-xl font-medium text-gray-400">
                  No products found
                </p>
                <p className="text-center text-sm text-gray-500 mt-1">
                  Try a different search term
                </p>
              </>
            ) : list.length === 0 ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-gray-500 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <p className="text-center text-xl font-medium text-gray-400">
                  No products available
                </p>
                <p className="text-center text-sm text-gray-500 mt-1">
                  Add a product using the button above
                </p>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-gray-500 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-center text-xl font-medium text-gray-400">
                  No products found
                </p>
                <p className="text-center text-sm text-gray-500 mt-1">
                  Try a different search term
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Products;
