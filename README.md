# Shop Price Calculator

![Shop Price Calculator](https://img.shields.io/badge/Shop%20Price-Calculator-brightgreen)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.7-38B2AC)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12.11.4-0055FF)

A modern, responsive web application for calculating prices and quantities for grocery shopping. This tool helps users quickly determine how much a specific quantity of a product will cost, or how much of a product they can get for a given price.


## 🌟 Features

- **Product Search**: Easily search for products from a comprehensive list
- **Dual Calculation**: Calculate either:
  - Price based on quantity
  - Quantity based on price
- **Product Management**:
  - Add new products to the list
  - Update prices of existing products
  - Data persists between sessions using localStorage
- **Real-time Results**: Instant calculation results with a modern UI
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices
- **Modern UI**: Sleek design with animations and intuitive interface

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ShopPrice.git
   cd ShopPrice
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173/
   ```

## 🔧 Usage

### Price Calculation
1. **Search for a Product**: Type the name of the product in the search field
2. **Enter Either**:
   - Quantity (in grams) to calculate the price
   - Price (in rupees) to calculate the quantity
3. **View Results**: See the calculation results displayed in an easy-to-read format

### Product Management
1. **Add a New Product**:
   - Click the "Add New Product" button
   - Enter the product name and price per kg
   - Click "Add Product" to save
2. **Update an Existing Product**:
   - Click the "Add New Product" button
   - Start typing an existing product name
   - The form will automatically switch to update mode
   - Modify the price and click "Update Price"
3. **Data Persistence**:
   - All products are automatically saved to your browser's localStorage
   - Your product list will be available when you return to the application

## 🧩 Components

The application consists of four main components:

### Search Component
- Handles user input for product selection, quantity, and price
- Manages the calculation logic
- Coordinates the overall application flow
- Handles localStorage persistence for product data

### Products Component
- Displays the list of available products
- Provides search functionality
- Allows for quick product selection

### Calculation Component
- Displays calculation results in a modern card-based layout
- Shows product details, price per kg, quantity, and total price
- Provides a summary of the calculation

### AddProduct Component
- Provides a popup form for adding new products
- Automatically detects existing products for price updates
- Switches between add and update modes based on product name
- Validates inputs before submission

## 🛠️ Technologies Used

- **React**: Frontend library for building user interfaces
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Framer Motion**: Animation library for React
- **Vite**: Next-generation frontend tooling
- **Web Storage API**: Browser localStorage for data persistence

## 📱 Responsive Design

The application is fully responsive and works on:
- Mobile devices
- Tablets
- Desktop computers

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Vite](https://vitejs.dev/)
- [Heroicons](https://heroicons.com/)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
