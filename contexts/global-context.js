"use client";
import { createContext, useContext, useEffect, useState } from "react";

const GlobalContext = createContext({
  products: [],
  setProducts: () => {},
  setSelectedProduct: () => {},
  lastVisible: null,
  setLastVisible: () => {},
  setCategories: () => {},
  categories: [],
  setSelectedCategory: () => {},
  selectedCategory: null,
  selectedInventory: null,
  setSelectedInventory: () => {},
  suppliers: [],
  setSuppliers: () => {},
  selectedSupplier: null,
  setSelectedSupplier: () => {},
  ascendingPrice: false,
  setAscendingPrice: () => {},
  filteredProducts: [], // Now a useState
  categoryFilter: null,
  setCategoryFilter: () => {},
  supplierFilter: null,
  setSupplierFilter: () => {},
});

export const useGlobalContext = () => useContext(GlobalContext);

export default function GlobalContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState(null);
  const [lastVisible, setLastVisible] = useState("");
  const [categories, setCategories] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState();
  const [suppliers, setSuppliers] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [ascendingPrice, setAscendingPrice] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [supplierFilter, setSupplierFilter] = useState(null);
  const [catLoading, setCatLoading] = useState(true);
  const [supLoading, setSupLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!Array.isArray(products)) {
      setFilteredProducts([]);
      return;
    }

    let fp = [...products].filter((p) => {
      const prod = p.product || p;
      const inv = p.inventory || null;

      if (categoryFilter && supplierFilter)
        return (
          prod.product_category === categoryFilter &&
          inv?.supplier_id === supplierFilter
        );
      if (categoryFilter) return prod.product_category === categoryFilter;
      if (supplierFilter) return inv?.supplier_id === supplierFilter;
      return true;
    });

    if (fp.length > 0) {
      const withoutInventory = fp.filter((p) => !p.inventory);
      const withInventory = fp
        .filter((p) => p.inventory)
        .sort((a, b) => {
          // Convert to numbers and provide fallbacks in case values are null/undefined
          const aPrice = Number(a.inventory.inventory_retail_price) || 0;
          const bPrice = Number(b.inventory.inventory_retail_price) || 0;
          console.log(aPrice, bPrice, ascendingPrice);
          return !ascendingPrice ? aPrice - bPrice : bPrice - aPrice;
        });

      // Recombine the arrays, with inventory items first
      fp = [...withInventory, ...withoutInventory];
    }

    setFilteredProducts(fp);
  }, [products, categoryFilter, supplierFilter, ascendingPrice]);

  useEffect(() => {
    if (!Array.isArray(products)) {
      setFilteredProducts([]);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = products.filter((product) => {
      const prod = product.product || product;
      return (
        prod.product_name.toLowerCase().includes(searchTermLower) ||
        prod.product_sku.toLowerCase().includes(searchTermLower)
      );
    });
    setFilteredProducts(filtered);
  }, [searchTerm]);

  const value = {
    user,
    setUser,
    dashboard,
    setDashboard,
    selectedProduct,
    setSelectedProduct,
    products,
    setProducts,
    lastVisible,
    setLastVisible,
    categories,
    setCategories,
    selectedCategory,
    setSelectedCategory,
    selectedInventory,
    setSelectedInventory,
    suppliers,
    setSuppliers,
    selectedSupplier,
    setSelectedSupplier,
    ascendingPrice,
    setAscendingPrice,
    filteredProducts,
    categoryFilter,
    setCategoryFilter,
    supplierFilter,
    setSupplierFilter,
    supLoading,
    setSupLoading,
    catLoading,
    setCatLoading,
    searchTerm,
    setSearchTerm,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
}
