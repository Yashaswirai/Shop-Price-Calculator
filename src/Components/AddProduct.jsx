import { useState } from "react";
import { Plus } from "lucide-react";
import ProductModal from "./ProductModal";

const AddProduct = ({ onAddProduct, productList }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-2 mb-2">
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold rounded-xl shadow-md hover:shadow-emerald-500/20 transition-all cursor-pointer text-sm"
      >
        <Plus className="w-4 h-4" />
        Add / Update Product
      </button>

      <ProductModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        existingProducts={productList}
        onSaveProduct={(data) => {
          onAddProduct({
            product: data.product,
            price_per_kg: data.price_per_kg,
            category: data.category,
            isUpdate: data.isUpdate,
          });
        }}
      />
    </div>
  );
};

export default AddProduct;
