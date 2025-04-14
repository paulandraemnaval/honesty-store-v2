"use client";
import { createContext, useContext, useState } from "react";

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
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
}
