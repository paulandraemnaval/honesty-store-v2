import { z } from "zod";

export const inventorySchema = z
  .object({
    inventory_wholesale_price: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.number({ invalid_type_error: "Wholesale price is required" }).min(0, {
        message: "Wholesale price must be a positive number.",
      })
    ),
    inventory_total_units: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.number({ invalid_type_error: "Total units is required" }).min(0, {
        message: "Total units must be a positive number.",
      })
    ),
    inventory_retail_price: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.number({ invalid_type_error: "Retail price is required" }).min(1, {
        message: "Retail price must be greater than 0.",
      })
    ),
    inventory_description: z.string().optional(),
    inventory_profit_margin: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.number({ message: "Profit margin is required" }).min(1, {
        message: "Profit margin must be greater than 0.",
      })
    ),
    inventory_expiration_date: z.date({
      message: "Expiration date is required",
    }),
  })
  .refine(
    (data) => data.inventory_retail_price >= data.inventory_wholesale_price,
    {
      path: ["inventory_retail_price"],
      message: "Retail price must be greater than wholesale price.",
    }
  );

export const productSchema = z.object({
  file: z
    .union([
      z.instanceof(File, { message: "Product image is required" }),
      z.string().url({ message: "Product image is required" }),
    ])
    .refine((val) => val instanceof File || val.length > 0, {
      message: "Product image is required.",
    }),
  product_name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  product_reorder_point: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce
      .number({ message: "Reorder point is required" })
      .min(0, { message: "Reorder point must be a positive number" })
  ),

  product_description: z.preprocess(
    (val) => (val == null ? "" : val),
    z.string()
  ),
  product_sku: z.preprocess((val) => (val == null ? "" : val), z.string()),
  product_uom: z.preprocess((val) => (val == null ? "" : val), z.string()),
  product_weight: z.preprocess((val) => (val == null ? "" : val), z.string()),
  product_dimension: z.preprocess(
    (val) => (val == null ? "" : val),
    z.string()
  ),
  product_category: z.preprocess(
    (val) => (val == null ? "" : val),
    z.string({ message: "Product category is required." })
  ),
});
