import { guard } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { DataTable, PageHeader, StatusBadge } from "@/components/ui";

const TEMPLATES = [
  { key: "invoice_ready", body: "Hello {{name}}, invoice {{invoice}} is ready: {{link}}" },
  { key: "order_update", body: "Hello {{name}}, order {{order}} is now {{status}}." },
  { key: "payment_reminder", body: "Hello {{name}}, {{amount}} is due on invoice {{invoice}}." },
  { key: "low_stock_staff", body: "Stock alert: {{product}} has {{quantity}} left." },
];

export default async function WhatsAppPage() {
  await guard("whatsapp.send");
  const { config, messages } = await api("/api/desk/whatsapp");
  return (
    <div>
      <PageHeader title="WhatsApp and notifications" description="Messages are sent only with provider credentials and customer opt-in. A wa.me link is recorded as click-to-chat, never as delivered." />
      <div className="mb-4 rounded-2xl border border-border bg-card p-4 text-sm">
        <p>Provider: {config.configured ? config.provider : "not configured"}</p>
        <p>Meta token: {config.metaReady ? "present" : "missing"} · Twilio: {config.twilioReady ? "present" : "missing"}</p>
        <p>Webhook: POST /api/whatsapp/webhook · verify token {config.verifyTokenSet ? "set" : "missing"} · app secret {config.appSecretSet ? "set" : "missing"}</p>
        <p className="mt-2 text-muted">Set WHATSAPP_PROVIDER to meta or twilio and the matching environment variables. Credentials are not stored in the database or shown here.</p>
      </div>
      <h2 className="mb-2 font-semibold">Templates</h2>
      <ul className="mb-4 space-y-2 text-sm">{TEMPLATES.map((template) => <li key={template.key} className="rounded-xl border border-border bg-card px-3 py-2"><strong>{template.key}</strong> · {template.body}</li>)}</ul>
      <DataTable columns={["When", "Customer", "Template", "Status", "Provider id", "Error"]} rows={messages.map((message) => [formatDateTime(message.createdAt), message.customer?.name || message.toPhone, message.templateKey, <StatusBadge key={message.id} value={message.status} />, message.providerMessageId || "—", message.error || "—"])} />
    </div>
  );
}
