"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { checkoutAction } from "@/server/shop-actions";
import { formatInr } from "@/lib/money";
import { priceSale } from "@/lib/pricing";
import { Button, ErrorText, inputClass } from "@/components/ui";

type CatalogItem = {
  variantId: string;
  name: string;
  flavor: string;
  weightLabel: string;
  sku: string;
  barcode: string;
  price: number;
  taxRate: number;
  image: string;
  available: number;
  category: string;
};

type CartLine = CatalogItem & { quantity: number; itemDiscount: number };
type Customer = { id: string; name: string; phone: string | null };
type PayMethod = "CASH" | "UPI" | "CARD" | "BANK_TRANSFER" | "OTHER";

export function PosScreen({ held, customers }: { held: { id: string; number: string; holdLabel: string | null; grandTotal: string }[]; customers: Customer[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [coupon, setCoupon] = useState("");
  const [method, setMethod] = useState<PayMethod>("CASH");
  const [reference, setReference] = useState("");
  const [splitAmount, setSplitAmount] = useState("");
  const [payments, setPayments] = useState<{ method: PayMethod; amount: number; reference?: string }[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [online, setOnline] = useState(true);
  const [key, setKey] = useState(() => crypto.randomUUID());
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      fetch(`/api/pos/catalog?q=${encodeURIComponent(query)}`)
        .then((response) => response.json())
        .then((data) => setItems(data.items || []))
        .catch(() => setError("Could not load products. Check your connection."));
    }, 180);
    return () => clearTimeout(handle);
  }, [query]);

  function add(item: CatalogItem) {
    setCart((current) => {
      const existing = current.find((line) => line.variantId === item.variantId);
      if (existing) return current.map((line) => line.variantId === item.variantId ? { ...line, quantity: line.quantity + 1 } : line);
      return [...current, { ...item, quantity: 1, itemDiscount: 0 }];
    });
  }

  const preview = useMemo(() => priceSale(cart.map((line) => ({ quantity: line.quantity, unitPrice: line.price, itemDiscount: line.itemDiscount, taxRate: line.taxRate })), orderDiscount, true), [cart, orderDiscount]);
  const paid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const due = Math.max(0, Number(preview.grandTotal.toFixed(2)) - paid);

  async function submit(mode: "complete" | "hold" | "draft") {
    if (!online) {
      setError("You are offline. This desk does not queue sales. Reconnect before billing.");
      return;
    }
    if (!cart.length) {
      setError("Add a product first.");
      return;
    }
    if (mode === "complete" && !confirming) {
      setConfirming(true);
      return;
    }
    setPending(true);
    setError("");
    const result = await checkoutAction({
      idempotencyKey: key,
      customerId: customerId || null,
      lines: cart.map((line) => ({ variantId: line.variantId, quantity: line.quantity, itemDiscount: line.itemDiscount })),
      payments: mode === "complete" ? (payments.length ? payments : due > 0 && customerId ? [] : [{ method, amount: Number(preview.grandTotal.toFixed(2)), reference }]) : [],
      orderDiscount,
      couponCode: coupon || null,
      mode,
      existingOrderId: null,
    });
    setPending(false);
    if ("error" in result && result.error) {
      setError(result.error);
      setConfirming(false);
      return;
    }
    if (!("orderId" in result)) return;
    setKey(crypto.randomUUID());
    setCart([]);
    setPayments([]);
    setConfirming(false);
    if (result.invoiceId) router.push(`/invoices/${result.invoiceId}?created=1`);
    else router.push(`/orders/${result.orderId}`);
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      {!online ? <div className="lg:col-span-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-danger">Connection lost. Sales are not saved offline.</div> : null}
      <div>
        <input autoFocus aria-label="Search by name, SKU, or barcode" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {
          if (event.key === "Enter" && items[0]) {
            const exact = items.find((item) => item.barcode === query || item.sku.toLowerCase() === query.toLowerCase());
            add(exact || items[0]);
            setQuery("");
          }
        }} placeholder="Scan barcode or search name / SKU" className={inputClass} />
        <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-3">
          {items.map((item) => (
            <button key={item.variantId} disabled={item.available <= 0} onClick={() => add(item)} className="rounded-2xl border border-border bg-card p-3 text-left disabled:opacity-50">
              <img src={item.image} alt="" className="mb-2 h-28 w-full rounded-xl object-cover" onError={(event) => { event.currentTarget.src = "/placeholders/product.svg"; }} />
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="text-xs text-muted">{[item.flavor, item.weightLabel, item.sku].filter(Boolean).join(" · ")}</p>
              <div className="mt-2 flex items-center justify-between text-sm"><span className="font-semibold">{formatInr(item.price)}</span><span className={item.available <= 0 ? "text-danger" : "text-muted"}>{item.available} in stock</span></div>
            </button>
          ))}
        </div>
      </div>
      <aside className="rounded-2xl border border-border bg-card p-4">
        <h2 className="font-semibold">Cart</h2>
        <div className="mt-3 space-y-3">
          {cart.length === 0 ? <p className="text-sm text-muted">Scan a product to start a bill.</p> : cart.map((line) => (
            <div key={line.variantId} className="border-b border-border pb-3">
              <div className="flex justify-between gap-2 text-sm"><span>{line.name}</span><button onClick={() => setCart(cart.filter((item) => item.variantId !== line.variantId))} aria-label={`Remove ${line.name}`}>Remove</button></div>
              <p className="text-xs text-muted">{[line.flavor, line.weightLabel].filter(Boolean).join(" · ")}</p>
              <div className="mt-2 flex items-center gap-2">
                <input aria-label={`Quantity for ${line.name}`} type="number" min={1} value={line.quantity} onChange={(event) => setCart(cart.map((item) => item.variantId === line.variantId ? { ...item, quantity: Number(event.target.value) } : item))} className="h-9 w-16 rounded-lg border border-border px-2" />
                <input aria-label={`Discount for ${line.name}`} type="number" min={0} value={line.itemDiscount} onChange={(event) => setCart(cart.map((item) => item.variantId === line.variantId ? { ...item, itemDiscount: Number(event.target.value) } : item))} className="h-9 w-24 rounded-lg border border-border px-2" />
                <span className="ml-auto text-sm font-medium">{formatInr(line.price * line.quantity)}</span>
              </div>
            </div>
          ))}
        </div>
        <label className="mt-3 grid gap-1 text-sm">Customer
          <select aria-label="Customer" value={customerId} onChange={(event) => setCustomerId(event.target.value)} className={inputClass}>
            <option value="">Walk-in customer</option>
            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}{customer.phone ? ` · ${customer.phone}` : ""}</option>)}
          </select>
        </label>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="text-sm">Bill discount<input aria-label="Order discount" type="number" min={0} value={orderDiscount} onChange={(event) => setOrderDiscount(Number(event.target.value))} className={inputClass} /></label>
          <label className="text-sm">Coupon<input aria-label="Coupon code" value={coupon} onChange={(event) => setCoupon(event.target.value)} className={inputClass} /></label>
        </div>
        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatInr(preview.gross.toString())}</dd></div>
          <div className="flex justify-between"><dt>Discounts</dt><dd>{formatInr(preview.discountTotal.toString())}</dd></div>
          <div className="flex justify-between"><dt>Tax</dt><dd>{formatInr(preview.taxTotal.toString())}</dd></div>
          <div className="flex justify-between"><dt>Round off</dt><dd>{formatInr(preview.roundOff.toString())}</dd></div>
          <div className="flex justify-between text-base font-semibold"><dt>Payable</dt><dd>{formatInr(preview.grandTotal.toString())}</dd></div>
        </dl>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <select aria-label="Payment method" value={method} onChange={(event) => setMethod(event.target.value as PayMethod)} className={inputClass}>
            {["CASH", "UPI", "CARD", "BANK_TRANSFER", "OTHER"].map((option) => <option key={option}>{option}</option>)}
          </select>
          <input aria-label="Payment reference" placeholder="Reference" value={reference} onChange={(event) => setReference(event.target.value)} className={inputClass} />
        </div>
        <div className="mt-2 flex gap-2">
          <input aria-label="Split amount" placeholder="Split amount" value={splitAmount} onChange={(event) => setSplitAmount(event.target.value)} className={inputClass} />
          <Button type="button" variant="secondary" onClick={() => { const amount = Number(splitAmount); if (amount > 0) { setPayments([...payments, { method, amount, reference }]); setSplitAmount(""); } }}>Add</Button>
        </div>
        {payments.length ? <ul className="mt-2 text-xs text-muted">{payments.map((payment, index) => <li key={index}>{payment.method} {formatInr(payment.amount)} <button onClick={() => setPayments(payments.filter((_, item) => item !== index))}>remove</button></li>)}</ul> : <p className="mt-2 text-xs text-muted">Leave split payments empty to take the full total by the selected method. A balance needs a customer.</p>}
        <ErrorText>{error}</ErrorText>
        {confirming ? <p className="mt-3 text-sm">Confirm sale of {formatInr(preview.grandTotal.toString())}?</p> : null}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button type="button" disabled={pending} onClick={() => submit("complete")}>{confirming ? "Confirm sale" : "Take payment"}</Button>
          <Button type="button" variant="secondary" disabled={pending} onClick={() => submit("hold")}>Hold</Button>
          <Button type="button" variant="ghost" disabled={pending} onClick={() => submit("draft")}>Save draft</Button>
          {confirming ? <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>Back</Button> : null}
        </div>
        {held.length ? <div className="mt-4"><p className="text-xs font-semibold uppercase text-muted">Held bills</p>{held.map((order) => <a key={order.id} className="mt-1 block text-sm underline" href={`/orders/${order.id}`}>{order.number} · {formatInr(order.grandTotal)}</a>)}</div> : null}
      </aside>
    </div>
  );
}
