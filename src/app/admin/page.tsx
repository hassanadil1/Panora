import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Editor dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Publish schemes only after polygon review and a verified tour with
        documented permission.
      </p>
      <ul className="list-inside list-disc text-sm">
        <li>
          <Link className="underline" href="/admin/schemes">
            Manage schemes
          </Link>
        </li>
        <li>
          <Link className="underline" href="/admin/allowlist">
            Manage embed hosts
          </Link>
        </li>
        <li>Content runbook: see `docs/CONTENT.md` in the repository</li>
      </ul>
    </div>
  );
}
