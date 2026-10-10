import { guard } from "@/lib/auth";
import { api, qs } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { DataTable, PageHeader, inputClass } from "@/components/ui";

export default async function AuditPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await guard("audit.view");
  const query = await searchParams;
  const logs = await api(`/api/desk/audit${qs(query)}`);
  return (
    <div>
      <PageHeader title="Audit logs" description="Price changes, stock adjustments, refunds, role changes, exports, and settings edits are recorded." />
      <form className="mb-3" action="/audit"><input className={inputClass} name="q" defaultValue={query.q} placeholder="Search action or summary" aria-label="Search audit logs" /></form>
      <DataTable columns={["When", "Staff", "Action", "Entity", "Summary"]} rows={logs.map((log) => [formatDateTime(log.createdAt), log.user?.name || "System", log.action, `${log.entityType}`, log.summary])} />
    </div>
  );
}
