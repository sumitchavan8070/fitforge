import { describe, expect, it } from "vitest";
import { priceSale, marginPercent } from "../lib/pricing";
import { splitGst } from "../lib/gst";
import { allocateFefo } from "../lib/fefo";
import { hasPermission } from "../lib/permissions";
import { expectedCashClosing, cashVariance } from "../lib/register-math";
import { verifyMetaSignature, signMetaBody } from "../lib/whatsapp-signature";
import { formatDocumentNumber } from "../lib/format";

describe("sale pricing", () => {
  it("applies item and order discounts before tax and rounds to the rupee", () => {
    const totals = priceSale([{ quantity: 2, unitPrice: 100, itemDiscount: 20, taxRate: 18 }], 10, true);
    expect(totals.gross.toFixed(2)).toBe("200.00");
    expect(totals.discountTotal.toFixed(2)).toBe("30.00");
    expect(totals.taxable.toFixed(2)).toBe("170.00");
    expect(totals.taxTotal.toFixed(2)).toBe("30.60");
    expect(totals.grandTotal.toFixed(2)).toBe("201.00");
  });

  it("does not let an order discount exceed the taxable merchandise", () => {
    const totals = priceSale([{ quantity: 1, unitPrice: 50, taxRate: 0 }], 80, false);
    expect(totals.orderDiscount.toFixed(2)).toBe("50.00");
    expect(totals.grandTotal.toFixed(2)).toBe("0.00");
  });
});

describe("gst and margin", () => {
  it("splits intra-state tax into CGST and SGST", () => {
    const tax = splitGst(100, "Maharashtra", "Maharashtra");
    expect(tax.cgst.plus(tax.sgst).toFixed(2)).toBe("100.00");
    expect(tax.igst.toFixed(2)).toBe("0.00");
  });

  it("uses IGST for another state", () => {
    const tax = splitGst(100, "Maharashtra", "Karnataka");
    expect(tax.igst.toFixed(2)).toBe("100.00");
  });

  it("calculates margin on selling price", () => {
    expect(marginPercent(80, 100)?.toFixed(2)).toBe("20.00");
  });
});

describe("FEFO allocation", () => {
  const now = new Date("2026-10-09T00:00:00Z");
  const batches = [
    { id: "later", quantity: 5, expiryDate: new Date("2026-12-01"), unitCost: 10 },
    { id: "sooner", quantity: 2, expiryDate: new Date("2026-11-01"), unitCost: 8 },
    { id: "expired", quantity: 9, expiryDate: new Date("2026-01-01"), unitCost: 1 },
    { id: "recalled", quantity: 9, expiryDate: new Date("2026-10-20"), unitCost: 1, recalled: true },
  ];

  it("consumes the earliest valid expiry first and skips expired or recalled stock", () => {
    const result = allocateFefo(batches, 4, now);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.allocations.map((row) => row.batchId)).toEqual(["sooner", "later"]);
    expect(result.allocations[0].quantity.toString()).toBe("2");
    expect(result.allocations[1].quantity.toString()).toBe("2");
  });

  it("refuses a sale that only has expired stock", () => {
    const result = allocateFefo([batches[2]], 1, now);
    expect(result.ok).toBe(false);
  });
});

describe("permissions, register, documents", () => {
  it("gives the owner every permission and cashiers only their list", () => {
    expect(hasPermission("Owner", [], "staff.manage")).toBe(true);
    expect(hasPermission("Cashier", ["pos.sell"], "staff.manage")).toBe(false);
    expect(hasPermission("Cashier", ["pos.sell"], "pos.sell")).toBe(true);
  });

  it("reconciles expected cash and variance", () => {
    const expected = expectedCashClosing(1000, [
      { direction: "IN", amount: 500, method: "CASH" },
      { direction: "OUT", amount: 100, method: "CASH" },
      { direction: "IN", amount: 900, method: "UPI" },
    ]);
    expect(expected.toFixed(2)).toBe("1400.00");
    expect(cashVariance(expected, 1390).toFixed(2)).toBe("-10.00");
  });

  it("formats invoice numbers and verifies WhatsApp signatures", () => {
    expect(formatDocumentNumber("INV", "2627", 12)).toBe("INV-2627-00012");
    const body = "{\"ok\":true}";
    const header = signMetaBody(body, "secret");
    expect(verifyMetaSignature(body, header, "secret")).toBe(true);
    expect(verifyMetaSignature(body, header, "other")).toBe(false);
  });
});
