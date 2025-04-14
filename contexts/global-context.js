"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

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
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [supplierFilter, setSupplierFilter] = useState(null);
  const [ascendingPrice, setAscendingPrice] = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [supLoading, setSupLoading] = useState(true);
  const sortedProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    return products
      .filter((item) => item.inventory?.inventory_retail_price != null)
      .sort((a, b) => {
        const priceA = a.inventory.inventory_retail_price;
        const priceB = b.inventory.inventory_retail_price;

        return ascendingPrice ? priceA - priceB : priceB - priceA;
      });
  }, [products, ascendingPrice]);

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
    sortedProducts,
    categoryFilter,
    setCategoryFilter,
    supplierFilter,
    setSupplierFilter,
    supLoading,
    setSupLoading,
    catLoading,
    setCatLoading,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
}
