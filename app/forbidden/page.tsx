import { LinkButton } from "@/components/ui";

export default function ForbiddenPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">You do not have access to that page.</h1>
        <p className="mt-2 text-sm text-muted">Ask an owner to change your role if this is part of your job.</p>
        <div className="mt-4"><LinkButton href="/">Back to dashboard</LinkButton></div>
      </div>
    </main>
  );
}
