import type { Permission } from "@/lib/permissions";

export const NAV: { href: string; label: string; icon: string; permission: Permission }[] = [
  { href: "/", label: "Dashboard", icon: "dashboard", permission: "dashboard.view" },
  { href: "/pos", label: "Point of Sale", icon: "pos", permission: "pos.sell" },
  { href: "/orders", label: "Orders", icon: "orders", permission: "orders.view" },
  { href: "/products", label: "Products", icon: "products", permission: "products.view" },
  { href: "/categories", label: "Categories", icon: "categories", permission: "categories.manage" },
  { href: "/inventory", label: "Inventory", icon: "inventory", permission: "inventory.view" },
  { href: "/suppliers", label: "Suppliers / Purchases", icon: "suppliers", permission: "suppliers.view" },
  { href: "/customers", label: "Customers", icon: "customers", permission: "customers.view" },
  { href: "/invoices", label: "Invoices", icon: "invoices", permission: "invoices.view" },
  { href: "/expenses", label: "Expenses", icon: "expenses", permission: "expenses.view" },
  { href: "/reports", label: "Reports & Analytics", icon: "reports", permission: "reports.view" },
  { href: "/whatsapp", label: "WhatsApp", icon: "whatsapp", permission: "whatsapp.send" },
  { href: "/promotions", label: "Promotions", icon: "promotions", permission: "promotions.manage" },
  { href: "/staff", label: "Staff & Permissions", icon: "staff", permission: "staff.view" },
  { href: "/settings", label: "Settings", icon: "settings", permission: "settings.manage" },
  { href: "/audit", label: "Audit Logs", icon: "audit", permission: "audit.view" },
];
