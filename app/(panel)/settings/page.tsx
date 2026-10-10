import { guard } from "@/lib/auth";
import { api } from "@/lib/api";
import { PageHeader, inputClass } from "@/components/ui"
import { ActionForm } from "@/components/action-form";
import { saveBrandAction, saveSettingsAction, saveUnitAction } from "@/server/shop-actions";

export default async function SettingsPage() {
  await guard("settings.manage");
  const { settings, brands, units, database, whatsapp, email, storage } = await api("/api/desk/settings");
  return (
    <div>
      <PageHeader title="Settings" description="Currency defaults to INR and the business timezone is Asia/Kolkata. Invoice numbers use the April–March financial year." />
      <ActionForm action={saveSettingsAction} className="grid gap-2 rounded-2xl border border-border bg-card p-4 md:grid-cols-2">
        {(["name", "legalName", "phone", "email", "gstin", "addressLine1", "city", "state", "pincode", "invoicePrefix", "upiId", "bankName", "accountName", "accountNumber", "ifsc", "receiptFooter"] as const).map((field) => (
          <label key={field} className="text-sm">{field}<input name={field} defaultValue={String(settings[field] ?? "")} className={inputClass} /></label>
        ))}
        <label className="text-sm">Low stock default<input name="lowStockDefault" type="number" defaultValue={settings.lowStockDefault} className={inputClass} /></label>
        <label className="text-sm">Expiry warning days<input name="expiryWarningDays" type="number" defaultValue={settings.expiryWarningDays} className={inputClass} /></label>
        <label className="text-sm">Default GST %<input name="defaultTaxRate" type="number" step="0.01" defaultValue={settings.defaultTaxRate.toString()} className={inputClass} /></label>
        <label className="text-sm">Discount approval %<input name="discountApprovalPercent" type="number" step="0.01" defaultValue={settings.discountApprovalPercent.toString()} className={inputClass} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="gstEnabled" defaultChecked={settings.gstEnabled} /> GST enabled</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="roundToRupee" defaultChecked={settings.roundToRupee} /> Round invoices to the rupee</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="multiLocation" defaultChecked={settings.multiLocation} /> Multi-location mode</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="loyaltyEnabled" defaultChecked={settings.loyaltyEnabled} /> Loyalty points</label>
        <button className="h-10 rounded-xl bg-accent text-sm font-semibold">Save settings</button>
      </ActionForm>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <ActionForm action={saveBrandAction} className="rounded-2xl border border-border bg-card p-4">
          <h2 className="font-semibold">Brands</h2>
          <ul className="my-2 text-sm">{brands.map((brand) => <li key={brand.id}>{brand.name}</li>)}</ul>
          <input name="name" className={inputClass} placeholder="New brand" aria-label="Brand name" />
          <button className="mt-2 h-10 rounded-xl bg-sidebar px-3 text-sm text-white">Add brand</button>
        </ActionForm>
        <ActionForm action={saveUnitAction} className="rounded-2xl border border-border bg-card p-4">
          <h2 className="font-semibold">Units</h2>
          <ul className="my-2 text-sm">{units.map((unit) => <li key={unit.id}>{unit.name} ({unit.code})</li>)}</ul>
          <input name="name" className={inputClass} placeholder="Name" aria-label="Unit name" />
          <input name="code" className={`${inputClass} mt-2`} placeholder="Code" aria-label="Unit code" />
          <button className="mt-2 h-10 rounded-xl bg-sidebar px-3 text-sm text-white">Add unit</button>
        </ActionForm>
      </div>
      <div className="mt-4 rounded-2xl border border-border bg-card p-4 text-sm">
        <h2 className="font-semibold">System health</h2>
        <p>Database: {database ? "connected" : "not reachable"}</p>
        <p>Images: {storage}</p>
        <p>Email: {email ? "configured" : "not configured"}</p>
        <p>WhatsApp: {whatsapp.configured ? whatsapp.provider : "click-to-chat only"}</p>
        <p className="mt-2 text-muted">Back up the gym_admin database from the API host. Product images are stored by the API. Do not commit .env.</p>
      </div>
    </div>
  );
}
