"use client";

import { useState } from "react";
import { sendInvoiceWhatsAppAction } from "@/server/shop-actions";
import { Button, ErrorText } from "@/components/ui";

export function WhatsAppShare({ invoiceId }: { invoiceId: string }) {
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  return (
    <div className="mt-4">
      <Button type="button" variant="secondary" onClick={async () => {
        const result = await sendInvoiceWhatsAppAction(invoiceId);
        if ("status" in result) {
          setError("");
          setMessage(result.status === "SENT" ? "Handed to the WhatsApp provider. Delivery is updated by webhook, not assumed." : result.status === "FAILED" ? `Provider error: ${result.error || "Unknown provider error"}` : "Credentials are not configured. This is a click-to-chat link, not a delivered message.");
          setUrl(result.url || null);
        } else setError(result.error || "Could not share.");
      }}>Share on WhatsApp</Button>
      <ErrorText>{error}</ErrorText>
      {message ? <p className="mt-2 text-sm">{message}</p> : null}
      {url ? <a className="mt-2 block text-sm font-semibold underline" href={url} target="_blank" rel="noreferrer">Open WhatsApp chat</a> : null}
    </div>
  );
}
