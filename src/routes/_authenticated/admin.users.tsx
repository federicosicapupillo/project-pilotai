import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getUserRegistrationStats } from "@/lib/user-stats.functions";
import { Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Admin — Utenti registrati" }] }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const fetchStats = useServerFn(getUserRegistrationStats);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "user-registration-stats"],
    queryFn: () => fetchStats(),
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="size-10 rounded-lg gradient-bg grid place-items-center glow-soft">
          <Users className="size-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-semibold">Utenti registrati</h1>
          <p className="text-sm text-muted-foreground">Solo numeri aggregati. Nessun dato personale.</p>
        </div>
      </div>

      {isLoading && <p className="text-muted-foreground">Caricamento…</p>}
      {error && (
        <div className="glass-card rounded-xl p-5 border border-destructive/30">
          <p className="text-sm text-destructive">
            {(error as Error).message === "Forbidden"
              ? "Accesso negato: questa area è riservata agli amministratori."
              : "Impossibile caricare le statistiche."}
          </p>
        </div>
      )}

      {data && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Totali" value={data.totalUsers} />
          <StatCard label="Oggi" value={data.usersToday} />
          <StatCard label="Ultimi 7 giorni" value={data.usersLast7Days} />
          <StatCard label="Ultimi 30 giorni" value={data.usersLast30Days} />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-display font-semibold gradient-text">
        {value.toLocaleString("it-IT")}
      </div>
    </div>
  );
}