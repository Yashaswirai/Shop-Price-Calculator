
import { motion } from 'framer-motion';
import Search from './Components/Search';

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <header className="mb-8">
          <motion.h1
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="text-3xl md:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500"
          >
            Shop Price Calculator
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-gray-400 mt-2"
          >
            Calculate prices and quantities for your grocery shopping
          </motion.p>
        </header>

        <main>
          <Search />
        </main>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Shop Price Calculator</p>
        </footer>
      </motion.div>
    </div>
  );
};

export default App;
