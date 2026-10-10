import { D, roundMoney } from "@/lib/money";
import type Decimal from "decimal.js";

export type RegisterMovement = {
  direction: "IN" | "OUT";
  amount: Decimal.Value;
  method?: string;
};

export function expectedCashClosing(opening: Decimal.Value, entries: RegisterMovement[]): Decimal {
  return entries.reduce((balance, entry) => {
    if (entry.method && entry.method !== "CASH") return balance;
    const amount = roundMoney(entry.amount);
    return entry.direction === "IN" ? balance.plus(amount) : balance.minus(amount);
  }, roundMoney(opening));
}

export function cashVariance(expected: Decimal.Value, counted: Decimal.Value): Decimal {
  return roundMoney(D(counted).minus(D(expected)));
}
