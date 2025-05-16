
import { motion } from 'framer-motion';

const Calculation = ({ calc }) => {
  // Check if calculation has data
  const hasData = calc && Object.keys(calc).length > 0;

  if (!hasData) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mt-8 p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl"
    >
      <h2 className="text-2xl font-bold text-white mb-4 border-b border-gray-700 pb-2">
        Calculation Results
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-700/50 p-4 rounded-lg backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-300">Product</h3>
            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{calc.product}</p>
        </motion.div>

        {/* Price Per Kg Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-700/50 p-4 rounded-lg backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-300">Price Per Kg</h3>
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">₹{calc.pricePerKg}</p>
        </motion.div>

        {/* Quantity Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-700/50 p-4 rounded-lg backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-300">Quantity</h3>
            <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{calc.quantity} g</p>
          <p className="text-sm text-gray-400 mt-1">{(calc.quantity / 1000).toFixed(2)} kg</p>
        </motion.div>

        {/* Total Price Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-700/50 p-4 rounded-lg backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-300">Total Price</h3>
            <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">₹{calc.price}</p>
        </motion.div>
      </div>

      {/* Summary Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg"
      >
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-white">Summary</h3>
            <p className="text-gray-300 mt-1">
              {calc.quantity}g of {calc.product} costs ₹{calc.price}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-gray-300">
              Rate: <span className="text-white font-medium">₹{(calc.price / (calc.quantity / 1000)).toFixed(2)}/kg</span>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Calculation;
