import Decimal from "decimal.js";

Decimal.set({ precision: 24, rounding: Decimal.ROUND_HALF_UP });

export type MoneyInput = Decimal.Value;

export function D(value: MoneyInput | null | undefined): Decimal {
  if (value === null || value === undefined || value === "") return new Decimal(0);
  return new Decimal(value);
}

export function money(value: MoneyInput | null | undefined): string {
  return D(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);
}

export function qty(value: MoneyInput | null | undefined): string {
  return D(value).toDecimalPlaces(3, Decimal.ROUND_HALF_UP).toFixed(3);
}

export function roundMoney(value: MoneyInput): Decimal {
  return D(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function roundQty(value: MoneyInput): Decimal {
  return D(value).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
}

export function roundRupee(value: MoneyInput): { rounded: Decimal; roundOff: Decimal } {
  const exact = roundMoney(value);
  const rounded = exact.toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
  return { rounded, roundOff: rounded.minus(exact) };
}

export function formatInr(value: MoneyInput | null | undefined, symbol = "₹"): string {
  const amount = Number(money(value));
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${symbol}${formatted}`;
}

export function dec(value: Decimal): string {
  return value.toFixed(2);
}
