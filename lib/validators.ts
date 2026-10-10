import { z } from "zod";

const moneyField = z.coerce.number().min(0).max(10_000_000);
const optionalText = z.string().trim().max(200).optional().or(z.literal(""));

export const variantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().trim().min(1).max(64),
  barcode: optionalText,
  flavor: z.string().trim().max(80).optional().default(""),
  weightLabel: z.string().trim().max(40).optional().default(""),
  weightGrams: z.coerce.number().int().positive().max(100_000).optional().nullable(),
  packaging: z.string().trim().max(40).optional().default(""),
  costPrice: moneyField,
  sellingPrice: moneyField,
  mrp: moneyField.optional().nullable(),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("ACTIVE"),
  isDefault: z.boolean().default(false),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  sku: z.string().trim().min(1).max(64),
  barcode: optionalText,
  brandId: z.string().optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  unitId: z.string().optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional().default(""),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]),
  hsnCode: z.string().trim().max(16).optional().default(""),
  taxRate: z.coerce.number().min(0).max(100),
  minStock: z.coerce.number().min(0).max(1_000_000),
  reorderQty: z.coerce.number().min(0).max(1_000_000),
  costPrice: moneyField,
  sellingPrice: moneyField,
  mrp: moneyField.optional().nullable(),
  trackExpiry: z.boolean().default(true),
  variants: z.array(variantSchema).min(1).max(40),
  imageUrls: z.array(z.string().trim().max(500)).max(8).optional().default([]),
});

export const customerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  gstin: z.string().trim().max(15).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().default(""),
  whatsappOptIn: z.boolean().default(false),
  emailOptIn: z.boolean().default(false),
  tags: z.array(z.string().trim().min(1).max(30)).max(12).optional().default([]),
  groupId: z.string().optional().or(z.literal("")),
  addressLine1: z.string().trim().max(200).optional().default(""),
  city: z.string().trim().max(80).optional().default(""),
  state: z.string().trim().max(80).optional().default(""),
  pincode: z.string().trim().max(12).optional().default(""),
});

export const supplierSchema = z.object({
  name: z.string().trim().min(2).max(160),
  contact: z.string().trim().max(120).optional().default(""),
  phone: z.string().trim().max(20).optional().default(""),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  gstin: z.string().trim().max(15).optional().default(""),
  address: z.string().trim().max(240).optional().default(""),
  city: z.string().trim().max(80).optional().default(""),
  state: z.string().trim().max(80).optional().default(""),
  notes: z.string().trim().max(1000).optional().default(""),
});

export const expenseSchema = z.object({
  categoryId: z.string().min(1),
  amount: moneyField.refine((value) => value > 0, "Amount must be greater than zero."),
  spentAt: z.string().min(8),
  method: z.enum(["CASH", "UPI", "CARD", "BANK_TRANSFER", "OTHER"]),
  vendor: z.string().trim().max(160).optional().default(""),
  notes: z.string().trim().max(1000).optional().default(""),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
});

export const passwordSchema = z
  .string()
  .min(10)
  .max(200)
  .regex(/[A-Z]/, "Include an uppercase letter.")
  .regex(/[a-z]/, "Include a lowercase letter.")
  .regex(/[0-9]/, "Include a number.");

export type ProductInput = z.infer<typeof productSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
