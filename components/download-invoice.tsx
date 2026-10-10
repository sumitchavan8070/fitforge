"use client";

import { useState } from "react";

export function DownloadInvoiceButton({ id, number, className = "" }: { id: string; number: string; className?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function download() {
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/invoices/${id}/pdf?download=1`, { credentials: "same-origin" });
      if (!response.ok) throw new Error("Could not download the invoice.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${number}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not download the invoice.");
    } finally {
      setPending(false);
    }
  }

  return (
    <span className="relative z-20 inline-flex flex-col items-start">
      <button
        type="button"
        onClick={download}
        disabled={pending}
        className={`inline-flex h-11 min-h-11 cursor-pointer items-center justify-center rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground disabled:opacity-60 ${className}`}
      >
        {pending ? "Downloading…" : "Download invoice"}
      </button>
      {error ? <span className="mt-1 text-xs text-danger">{error}</span> : null}
    </span>
  );
}
