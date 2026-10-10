import { D, roundMoney } from "@/lib/money";
import type Decimal from "decimal.js";

export type TaxSplit = {
  cgst: Decimal;
  sgst: Decimal;
  igst: Decimal;
  total: Decimal;
};

export function splitGst(taxAmount: Decimal.Value, shopState: string, customerState: string | null | undefined): TaxSplit {
  const tax = roundMoney(taxAmount);
  const sameState = !customerState || normalizeState(customerState) === normalizeState(shopState);
  if (sameState) {
    const half = tax.div(2).toDecimalPlaces(2);
    const other = tax.minus(half);
    return { cgst: half, sgst: other, igst: D(0), total: tax };
  }
  return { cgst: D(0), sgst: D(0), igst: tax, total: tax };
}

export function normalizeState(value: string): string {
  return value.trim().toLowerCase();
}
