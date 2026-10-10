"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

export function PermissionEditor({
  roleId,
  name,
  locked,
  selected,
  options,
  action,
}: {
  roleId: string;
  name: string;
  locked: boolean;
  selected: string[];
  options: { key: string; label: string }[];
  action: (roleId: string, keys: string[]) => Promise<{ error?: string; ok?: boolean }>;
}) {
  const [keys, setKeys] = useState(selected);
  const [message, setMessage] = useState("");
  return (
    <form className="rounded-2xl border border-border bg-card p-4" onSubmit={async (event) => {
      event.preventDefault();
      const result = await action(roleId, keys);
      setMessage(result.error || "Saved");
    }}>
      <h2 className="font-semibold">{name}</h2>
      <div className="mt-2 grid gap-1 md:grid-cols-2">
        {options.map((option) => (
          <label key={option.key} className="flex items-center gap-2 text-sm">
            <input type="checkbox" disabled={locked} checked={locked || keys.includes(option.key)} onChange={(event) => setKeys(event.target.checked ? [...keys, option.key] : keys.filter((key) => key !== option.key))} />
            {option.label}
          </label>
        ))}
      </div>
      {locked ? <p className="mt-2 text-xs text-muted">Owner access is fixed.</p> : <Button className="mt-3" type="submit">Save permissions</Button>}
      {message ? <p className="mt-2 text-sm">{message}</p> : null}
    </form>
  );
}
