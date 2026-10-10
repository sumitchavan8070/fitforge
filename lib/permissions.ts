export const PERMISSIONS = [
  "dashboard.view",
  "pos.sell",
  "pos.discount",
  "pos.discount_approve",
  "pos.override_price",
  "pos.refund",
  "pos.hold",
  "orders.view",
  "orders.manage",
  "orders.cancel",
  "products.view",
  "products.write",
  "products.delete",
  "products.import",
  "products.export",
  "inventory.view",
  "inventory.adjust",
  "inventory.override_negative",
  "inventory.count",
  "inventory.transfer",
  "categories.manage",
  "suppliers.view",
  "suppliers.manage",
  "purchases.manage",
  "customers.view",
  "customers.manage",
  "customers.export",
  "invoices.view",
  "invoices.manage",
  "invoices.credit",
  "expenses.view",
  "expenses.manage",
  "reports.view",
  "reports.financial",
  "whatsapp.send",
  "promotions.manage",
  "staff.view",
  "staff.manage",
  "settings.manage",
  "audit.view",
  "register.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<Permission, string> = {
  "dashboard.view": "View dashboard",
  "pos.sell": "Create counter sales",
  "pos.discount": "Apply discounts within the approval threshold",
  "pos.discount_approve": "Approve discounts above the threshold",
  "pos.override_price": "Override a product selling price",
  "pos.refund": "Process returns and refunds",
  "pos.hold": "Hold and resume sales",
  "orders.view": "View orders",
  "orders.manage": "Create and update orders",
  "orders.cancel": "Cancel orders",
  "products.view": "View products",
  "products.write": "Create and edit products",
  "products.delete": "Archive or delete products",
  "products.import": "Import products",
  "products.export": "Export products",
  "inventory.view": "View inventory",
  "inventory.adjust": "Adjust stock",
  "inventory.override_negative": "Allow negative stock",
  "inventory.count": "Post stock counts",
  "inventory.transfer": "Transfer stock between locations",
  "categories.manage": "Manage categories",
  "suppliers.view": "View suppliers",
  "suppliers.manage": "Manage suppliers",
  "purchases.manage": "Manage purchases and receiving",
  "customers.view": "View customers",
  "customers.manage": "Create and edit customers",
  "customers.export": "Export customers",
  "invoices.view": "View invoices",
  "invoices.manage": "Record invoice payments",
  "invoices.credit": "Issue credit notes",
  "expenses.view": "View expenses",
  "expenses.manage": "Record expenses",
  "reports.view": "View operational reports",
  "reports.financial": "View financial reports and exports",
  "whatsapp.send": "Send WhatsApp messages",
  "promotions.manage": "Manage promotions",
  "staff.view": "View staff",
  "staff.manage": "Manage staff and permissions",
  "settings.manage": "Manage shop settings",
  "audit.view": "View audit logs",
  "register.manage": "Open and close the cash register",
};

const ALL = [...PERMISSIONS];

function except(keys: Permission[]): Permission[] {
  const skip = new Set(keys);
  return ALL.filter((key) => !skip.has(key));
}

export const ROLE_DEFAULTS: Record<string, Permission[]> = {
  Owner: ALL,
  Manager: except(["staff.manage"]),
  Cashier: [
    "dashboard.view",
    "pos.sell",
    "pos.discount",
    "pos.hold",
    "orders.view",
    "customers.view",
    "customers.manage",
    "invoices.view",
    "whatsapp.send",
    "register.manage",
  ],
  "Inventory Staff": [
    "dashboard.view",
    "products.view",
    "products.write",
    "products.import",
    "products.export",
    "inventory.view",
    "inventory.adjust",
    "inventory.count",
    "inventory.transfer",
    "categories.manage",
    "suppliers.view",
    "suppliers.manage",
    "purchases.manage",
  ],
  Accountant: [
    "dashboard.view",
    "orders.view",
    "customers.view",
    "customers.export",
    "invoices.view",
    "invoices.manage",
    "invoices.credit",
    "expenses.view",
    "expenses.manage",
    "reports.view",
    "reports.financial",
    "audit.view",
    "register.manage",
    "suppliers.view",
  ],
};

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  Owner: "Full access, including staff permissions and shop settings.",
  Manager: "Day-to-day operations, reports, and approvals. Cannot change staff roles.",
  Cashier: "Counter sales, customers, and receipts.",
  "Inventory Staff": "Products, stock, suppliers, and goods receiving.",
  Accountant: "Invoices, expenses, payments, and financial reports.",
};

export function hasPermission(
  roleName: string,
  granted: Iterable<string>,
  permission: Permission | string,
): boolean {
  if (roleName === "Owner") return true;
  for (const key of granted) {
    if (key === permission) return true;
  }
  return false;
}
