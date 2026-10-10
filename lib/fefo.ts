import { D, roundQty } from "@/lib/money";
import type Decimal from "decimal.js";

export type FefoBatch = {
  id: string;
  quantity: Decimal.Value;
  reserved?: Decimal.Value;
  expiryDate: Date | null;
  recalled?: boolean;
  unitCost: Decimal.Value;
};

export type FefoAllocation = {
  batchId: string;
  quantity: Decimal;
  unitCost: Decimal;
};

export type FefoResult =
  | { ok: true; allocations: FefoAllocation[]; totalCost: Decimal }
  | { ok: false; error: string; shortage: Decimal };

function available(batch: FefoBatch): Decimal {
  return roundQty(D(batch.quantity).minus(D(batch.reserved ?? 0)));
}

export function isExpired(expiry: Date | null, now: Date): boolean {
  if (!expiry) return false;
  return expiry.getTime() < now.getTime();
}

/**
 * First Expiry, First Out. Batches without an expiry date sort last.
 * Recalled and expired batches are never allocated.
 */
export function allocateFefo(batches: FefoBatch[], requested: Decimal.Value, now: Date): FefoResult {
  const need = roundQty(requested);
  if (need.lte(0)) return { ok: false, error: "Quantity must be greater than zero.", shortage: need };

  const sorted = [...batches].sort((a, b) => {
    if (a.expiryDate && b.expiryDate) return a.expiryDate.getTime() - b.expiryDate.getTime();
    if (a.expiryDate) return -1;
    if (b.expiryDate) return 1;
    return a.id.localeCompare(b.id);
  });

  let remaining = need;
  const allocations: FefoAllocation[] = [];

  for (const batch of sorted) {
    if (remaining.lte(0)) break;
    if (batch.recalled) continue;
    if (isExpired(batch.expiryDate, now)) continue;
    const free = available(batch);
    if (free.lte(0)) continue;
    const take = DecimalMin(free, remaining);
    allocations.push({ batchId: batch.id, quantity: take, unitCost: roundQtyCost(batch.unitCost) });
    remaining = remaining.minus(take);
  }

  if (remaining.gt(0)) {
    return {
      ok: false,
      error: "Not enough sellable stock. Expired and recalled batches are excluded.",
      shortage: remaining,
    };
  }

  const totalCost = allocations.reduce((sum, row) => sum.plus(row.quantity.mul(row.unitCost)), D(0));
  return { ok: true, allocations, totalCost };
}

function DecimalMin(a: Decimal, b: Decimal): Decimal {
  return a.lte(b) ? a : b;
}

function roundQtyCost(value: Decimal.Value): Decimal {
  return D(value).toDecimalPlaces(2);
}
