"use client";
import { createContext, useContext, useEffect, useState, useMemo } from "react";

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
  filteredProducts: [],
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
  const [ascendingPrice, setAscendingPrice] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [supplierFilter, setSupplierFilter] = useState(null);
  const [catLoading, setCatLoading] = useState(true);
  const [supLoading, setSupLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ascendingUnits, setAscendingUnits] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const togglePriceSort = () => {
    setAscendingPrice((prev) => {
      const newValue = prev === null ? true : prev === true ? false : null;

      if (newValue !== null) {
        setAscendingUnits(null);
      }

      return newValue;
    });
  };

  const toggleUnitSort = () => {
    setAscendingUnits((prev) => {
      const newValue = prev === null ? true : prev === true ? false : null;

      if (newValue !== null) {
        setAscendingPrice(null);
      }

      return newValue;
    });
  };

  const filteredAndSortedProducts = useMemo(() => {
    if (!Array.isArray(products)) {
      return [];
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
      let withInventory = fp.filter((p) => p.inventory);

      // Apply sorting if any sort is active
      if (ascendingPrice !== null) {
        withInventory = withInventory.sort((a, b) => {
          const aPrice = Number(a.inventory.inventory_retail_price) || 0;
          const bPrice = Number(b.inventory.inventory_retail_price) || 0;
          return !ascendingPrice ? aPrice - bPrice : bPrice - aPrice;
        });
      } else if (ascendingUnits !== null) {
        withInventory = withInventory.sort((a, b) => {
          const aUnits = Number(a.inventory.inventory_total_units) || 0;
          const bUnits = Number(b.inventory.inventory_total_units) || 0;
          return !ascendingUnits ? aUnits - bUnits : bUnits - aUnits;
        });
      }

      fp = [...withInventory, ...withoutInventory];
    }

    return fp;
  }, [
    products,
    categoryFilter,
    supplierFilter,
    ascendingPrice,
    ascendingUnits,
  ]);

  useEffect(() => {
    setFilteredProducts(filteredAndSortedProducts);
  }, [filteredAndSortedProducts]);
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
    togglePriceSort,
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
    ascendingUnits,
    toggleUnitSort,
    setSelectedUser,
    selectedUser,
    users,
    setUsers,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
}
