import Decimal from "decimal.js";
import { D, roundMoney, roundRupee } from "@/lib/money";

export type PricedLineInput = {
  quantity: Decimal.Value;
  unitPrice: Decimal.Value;
  itemDiscount?: Decimal.Value;
  taxRate?: Decimal.Value;
};

export type PricedLine = {
  quantity: Decimal;
  unitPrice: Decimal;
  itemDiscount: Decimal;
  orderDiscountShare: Decimal;
  taxable: Decimal;
  taxRate: Decimal;
  taxAmount: Decimal;
  lineTotal: Decimal;
};

export type SaleTotals = {
  lines: PricedLine[];
  gross: Decimal;
  itemDiscountTotal: Decimal;
  orderDiscount: Decimal;
  discountTotal: Decimal;
  taxable: Decimal;
  taxTotal: Decimal;
  exactTotal: Decimal;
  roundOff: Decimal;
  grandTotal: Decimal;
};

/**
 * Prices are tax-exclusive.
 * Item discounts apply first. The order discount is spread across lines by
 * discounted line value, then GST is calculated on the remaining taxable value.
 */
export function priceSale(
  inputs: PricedLineInput[],
  orderDiscountInput: Decimal.Value = 0,
  roundToRupee = true,
): SaleTotals {
  const drafts = inputs.map((input) => {
    const quantity = D(input.quantity);
    const unitPrice = roundMoney(input.unitPrice);
    const gross = roundMoney(quantity.mul(unitPrice));
    const itemDiscount = Decimal.min(roundMoney(input.itemDiscount ?? 0), gross);
    const net = gross.minus(itemDiscount);
    return { quantity, unitPrice, itemDiscount, gross, net, taxRate: D(input.taxRate ?? 0) };
  });

  const afterItem = drafts.reduce((sum, line) => sum.plus(line.net), D(0));
  const requested = roundMoney(orderDiscountInput);
  const orderDiscount = Decimal.min(Decimal.max(requested, 0), afterItem);

  let allocated = D(0);
  const lines: PricedLine[] = drafts.map((line, index) => {
    let share = D(0);
    if (orderDiscount.gt(0) && afterItem.gt(0)) {
      if (index === drafts.length - 1) {
        share = orderDiscount.minus(allocated);
      } else {
        share = roundMoney(orderDiscount.mul(line.net).div(afterItem));
        allocated = allocated.plus(share);
      }
    }
    const taxable = roundMoney(line.net.minus(share));
    const taxAmount = roundMoney(taxable.mul(line.taxRate).div(100));
    const lineTotal = taxable.plus(taxAmount);
    return {
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      itemDiscount: line.itemDiscount,
      orderDiscountShare: share,
      taxable,
      taxRate: line.taxRate,
      taxAmount,
      lineTotal,
    };
  });

  const gross = drafts.reduce((sum, line) => sum.plus(line.gross), D(0));
  const itemDiscountTotal = drafts.reduce((sum, line) => sum.plus(line.itemDiscount), D(0));
  const taxable = lines.reduce((sum, line) => sum.plus(line.taxable), D(0));
  const taxTotal = lines.reduce((sum, line) => sum.plus(line.taxAmount), D(0));
  const exactTotal = roundMoney(taxable.plus(taxTotal));
  const rupee = roundToRupee ? roundRupee(exactTotal) : { rounded: exactTotal, roundOff: D(0) };

  return {
    lines,
    gross: roundMoney(gross),
    itemDiscountTotal: roundMoney(itemDiscountTotal),
    orderDiscount,
    discountTotal: roundMoney(itemDiscountTotal.plus(orderDiscount)),
    taxable: roundMoney(taxable),
    taxTotal: roundMoney(taxTotal),
    exactTotal,
    roundOff: rupee.roundOff,
    grandTotal: rupee.rounded,
  };
}

export function marginPercent(cost: Decimal.Value, selling: Decimal.Value): Decimal | null {
  const price = D(selling);
  if (price.lte(0)) return null;
  return roundMoney(price.minus(D(cost)).div(price).mul(100));
}

export function discountExceedsThreshold(
  grossAfterItemDiscounts: Decimal.Value,
  extraDiscount: Decimal.Value,
  thresholdPercent: Decimal.Value,
): boolean {
  const base = D(grossAfterItemDiscounts);
  if (base.lte(0)) return D(extraDiscount).gt(0);
  const percent = D(extraDiscount).div(base).mul(100);
  return percent.gt(D(thresholdPercent));
}
