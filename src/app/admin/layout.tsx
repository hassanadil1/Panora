import Link from "next/link";
import { requireEditor } from "@/lib/auth/require-editor";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireEditor();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex gap-4 text-sm font-medium">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/schemes">Schemes</Link>
            <Link href="/admin/allowlist">Embed allowlist</Link>
          </div>
          <Link href="/" className="text-sm text-muted-foreground underline">
            Map
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-5xl p-4">{children}</div>
    </div>
  );
}
