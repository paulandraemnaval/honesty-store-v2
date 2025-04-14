export const productDefaults = {
  product_name: "",
  product_image: undefined,
  product_reorder_point: 0,
  product_description: "",
  product_sku: "",
  product_uom: "",
  product_weight: "",
  product_dimension: "",
  product_category: "",
};

export const inventoryDefaults = {
  inventory_wholesale_price: 0,
  inventory_total_units: 0,
  inventory_retail_price: 0,
  inventory_description: "",
  inventory_profit_margin: 0,
  inventory_expiration_date: new Date(),
};

export const categoryDefaults = {
  category_name: "",
  category_description: "",
  category_image: undefined,
};

export const supplierDefaults = {
  supplier_name: "",
  supplier_contact_person: "",
  supplier_contact_number: "",
  supplier_email_address: "",
  supplier_notes: "",
};
