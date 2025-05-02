import { z } from "zod";

export const inventorySchema = z
  .object({
    inventory_wholesale_price: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.number({ invalid_type_error: "Wholesale price is required" }).min(1, {
        message: "Wholesale price must be a positive number.",
      })
    ),
    inventory_total_units: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.number({ invalid_type_error: "Total units is required" }).min(0, {
        message: "Total units must at least be 1.",
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
    supplier_id: z.string({
      required_error: "Please select a supplier",
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

export const categorySchema = z.object({
  file: z
    .union([
      z.instanceof(File, { message: "Category image is required" }),
      z.string().url({ message: "Category image is required" }),
    ])
    .refine((val) => val instanceof File || val.length > 0, {
      message: "Category image is required.",
    }),
  category_name: z.string().min(2, {
    message: "Category name must be at least 2 characters.",
  }),
  category_description: z.string().optional(),
});

export const supplierSchema = z.object({
  supplier_name: z.string().min(2, {
    message: "Supplier name must be at least 2 characters.",
  }),
  supplier_contact_person: z.string().min(1, {
    message: "Contact person is required.",
  }),
  supplier_contact_number: z.string().refine(
    (value) => {
      const phNumberRegex = /^(09\d{9}|\+639\d{9})$/;
      return phNumberRegex.test(value);
    },
    {
      message:
        "Must be a valid Philippine number (09XXXXXXXXX or +639XXXXXXXXX)",
    }
  ),
  supplier_email_address: z.string().email({
    message: "Invalid email address.",
  }),
  supplier_notes: z.string().optional(),
});

export const reportFormSchema = z.object({
  cash_inflow: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Cash Inflow must be a valid number",
    })
    .refine((val) => parseFloat(val) >= 0, {
      message: "Cash Inflow must be greater than or equal to 0",
    }),
  cash_outflow: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Cash Outflow must be a valid number",
    })
    .refine((val) => parseFloat(val) >= 0, {
      message: "Cash Outflow must be greater than or equal to 0",
    }),
});

export const userSchema = z
  .object({
    name: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username cannot exceed 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional()
      .or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
    role: z.enum(["Admin", "Treasurer", "Auditor", "Secretary"], {
      required_error: "Please select a role",
    }),
    file: z
      .union([
        z.instanceof(File, { message: "Product image is required" }),
        z.string().url({ message: "Product image is required" }),
      ])
      .refine((val) => val instanceof File || val.length > 0, {
        message: "Product image is required.",
      }),
  })
  .refine(
    (data) => {
      // In create mode, password is required
      if (!data.password && data.password !== "") {
        return true; // Skip validation if empty string in edit mode
      }
      return data.password === data.confirmPassword;
    },
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }
  );
