import { useReadiness } from "@/features/home/hooks/useHealth";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function HomePage() {
  const readiness = useReadiness();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <section className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">InnoQuest</h1>
        <p className="text-muted-foreground">
          AI-powered gamified student innovation &amp; idea incubation platform.
        </p>
      </section>

      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Backend connectivity</h2>
            <p className="text-sm text-muted-foreground">
              Verifies the React app can reach the FastAPI service through the Vite
              proxy and that the database is reachable.
            </p>
          </div>
          <StatusBadge
            state={
              readiness.isLoading
                ? "loading"
                : readiness.isError
                  ? "error"
                  : readiness.data?.status === "ready"
                    ? "ok"
                    : "error"
            }
          />
        </div>

        {readiness.isError && (
          <p className="mt-4 text-sm text-destructive">
            Failed to reach the backend. Ensure the FastAPI server is running on
            port 8000 and the MySQL database is provisioned.
          </p>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ state }: { state: "loading" | "ok" | "error" }) {
  const map = {
    loading: { label: "Checking...", className: "bg-secondary text-secondary-foreground" },
    ok: { label: "Connected", className: "bg-emerald-100 text-emerald-700" },
    error: { label: "Unreachable", className: "bg-destructive/10 text-destructive" },
  } as const;
  const { label, className } = map[state];
  return <Badge className={cn(className)}>{label}</Badge>;
}
