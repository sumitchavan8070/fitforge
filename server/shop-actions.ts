"use server";

import { formBody, postAction } from "@/lib/api";

export async function saveProductAction(input: unknown, id?: string) {
  return postAction("/api/actions/save-product", { input, id });
}

export async function archiveProductAction(id: string) {
  return postAction("/api/actions/archive-product", { id });
}

export async function deleteProductAction(id: string) {
  return postAction("/api/actions/delete-product", { id });
}

export async function bulkProductsAction(formData: FormData) {
  return postAction("/api/actions/bulk-products", formBody(formData));
}

export async function adjustStockAction(formData: FormData) {
  return postAction("/api/actions/adjust-stock", formBody(formData));
}

export async function transferStockAction(formData: FormData) {
  return postAction("/api/actions/transfer-stock", formBody(formData));
}

export async function checkoutAction(input: unknown) {
  return postAction("/api/actions/checkout", input);
}

export async function cancelOrderAction(formData: FormData) {
  return postAction("/api/actions/cancel-order", formBody(formData));
}

export async function returnSaleAction(formData: FormData) {
  return postAction("/api/actions/return-sale", formBody(formData));
}

export async function payInvoiceAction(formData: FormData) {
  return postAction("/api/actions/pay-invoice", formBody(formData));
}

export async function saveCustomerAction(formData: FormData) {
  return postAction("/api/actions/save-customer", formBody(formData));
}

export async function saveSupplierAction(formData: FormData) {
  return postAction("/api/actions/save-supplier", formBody(formData));
}

export async function createPurchaseAction(payload: unknown) {
  return postAction("/api/actions/create-purchase", payload);
}

export async function receiveGoodsAction(payload: unknown) {
  return postAction("/api/actions/receive-goods", payload);
}

export async function paySupplierAction(formData: FormData) {
  return postAction("/api/actions/pay-supplier", formBody(formData));
}

export async function supplierReturnAction(formData: FormData) {
  return postAction("/api/actions/supplier-return", formBody(formData));
}

export async function saveExpenseAction(formData: FormData) {
  return postAction("/api/actions/save-expense", formBody(formData));
}

export async function saveCategoryAction(formData: FormData) {
  return postAction("/api/actions/save-category", formBody(formData));
}

export async function savePromotionAction(formData: FormData) {
  return postAction("/api/actions/save-promotion", formBody(formData));
}

export async function togglePromotionAction(id: string, isActive: boolean) {
  return postAction("/api/actions/toggle-promotion", { id, isActive });
}

export async function saveStaffAction(formData: FormData) {
  return postAction("/api/actions/save-staff", formBody(formData));
}

export async function updateStaffAction(formData: FormData) {
  return postAction("/api/actions/update-staff", formBody(formData));
}

export async function updateRolePermissionsAction(roleId: string, keys: string[]) {
  return postAction("/api/actions/update-role", { roleId, keys });
}

export async function saveSettingsAction(formData: FormData) {
  return postAction("/api/actions/save-settings", formBody(formData));
}

export async function saveBrandAction(formData: FormData) {
  return postAction("/api/actions/save-brand", formBody(formData));
}

export async function saveUnitAction(formData: FormData) {
  return postAction("/api/actions/save-unit", formBody(formData));
}

export async function sendInvoiceWhatsAppAction(invoiceId: string) {
  return postAction("/api/actions/whatsapp", { invoiceId });
}

export async function createManualOrderAction(formData: FormData) {
  return postAction("/api/actions/manual-order", formBody(formData));
}
