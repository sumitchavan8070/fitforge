import { guard } from "@/lib/auth";
import { api } from "@/lib/api";
import { PERMISSIONS, PERMISSION_LABELS } from "@/lib/permissions";
import { PageHeader, StatusBadge, inputClass } from "@/components/ui"
import { ActionForm } from "@/components/action-form";
import { saveStaffAction, updateRolePermissionsAction, updateStaffAction } from "@/server/shop-actions";
import { PermissionEditor } from "@/components/permission-editor";

export default async function StaffPage() {
  const actor = await guard("staff.view");
  const { users, roles } = await api("/api/desk/staff");
  const manage = actor.roleName === "Owner" || actor.permissions.includes("staff.manage");
  return (
    <div>
      <PageHeader title="Staff and permissions" description="The owner role always keeps full access, even if permission rows are edited." />
      <ul className="space-y-2">{users.map((user) => (
        <li key={user.id} className="rounded-xl border border-border bg-card px-3 py-2 text-sm">
          <div className="flex items-center justify-between"><span>{user.name} · {user.email}</span><StatusBadge value={user.status} /></div>
          {manage ? (
            <ActionForm action={updateStaffAction} className="mt-2 flex gap-2">
              <input type="hidden" name="id" value={user.id} />
              <input name="name" defaultValue={user.name} className={inputClass} aria-label={`Name for ${user.email}`} />
              <select name="roleId" defaultValue={user.roleId} className={inputClass} aria-label="Role">{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select>
              <select name="status" defaultValue={user.status} className={inputClass} aria-label="Status"><option>ACTIVE</option><option>DISABLED</option></select>
              <button className="h-10 rounded-xl bg-sidebar px-3 text-white">Save</button>
            </ActionForm>
          ) : <p className="text-muted">{user.role.name}</p>}
        </li>
      ))}</ul>
      {manage ? (
        <>
          <ActionForm action={saveStaffAction} className="mt-4 grid gap-2 rounded-2xl border border-border bg-card p-4 md:grid-cols-4">
            <input name="name" required placeholder="Name" className={inputClass} aria-label="Staff name" />
            <input name="email" type="email" required placeholder="Email" className={inputClass} aria-label="Staff email" />
            <input name="password" type="password" required placeholder="Temporary password" className={inputClass} aria-label="Temporary password" />
            <select name="roleId" className={inputClass} aria-label="Role">{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select>
            <button className="h-10 rounded-xl bg-accent text-sm font-semibold">Add staff</button>
          </ActionForm>
          <div className="mt-6 space-y-4">
            {roles.map((role) => (
              <PermissionEditor key={role.id} roleId={role.id} name={role.name} locked={role.name === "Owner"} selected={role.permissions.map((row) => row.permission.key)} options={PERMISSIONS.filter((key) => key !== "register.manage").map((key) => ({ key, label: PERMISSION_LABELS[key] }))} action={updateRolePermissionsAction} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
