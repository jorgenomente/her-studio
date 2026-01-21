import { cookies } from "next/headers";

import { ClientCard } from "@/components/app/clients/client-card";
import { ClientsSearch } from "@/components/app/clients/clients-search";
import { fetchClientsList } from "@/lib/queries/clients";

type SearchParams = {
  q?: string;
};

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const cookieStore = await cookies();
  const activeBranchId = cookieStore.get("hs_branch_id")?.value ?? null;
  const query = searchParams.q?.trim() ?? "";

  if (!activeBranchId) {
    return (
      <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
        Selecciona una sucursal para ver clientes.
      </div>
    );
  }

  let clients = [];
  let error: string | null = null;

  try {
    clients = await fetchClientsList({ branchId: activeBranchId, query });
  } catch (err) {
    error = err instanceof Error ? err.message : "Error cargando clientes.";
  }

  const typedClients = clients as {
    client_id: string;
    full_name?: string | null;
    phone: string;
    last_visit_at?: string | null;
    visits_count: number;
    total_spent: number;
  }[];

  return (
    <div className="space-y-4">
      <ClientsSearch initialQuery={query} />

      {error ? (
        <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-xl border p-6 text-sm">
          {error}
        </div>
      ) : null}

      {!error && clients.length === 0 ? (
        <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
          No encontramos clientes. Probá buscar por teléfono.
        </div>
      ) : null}

      <div className="space-y-3">
        {typedClients.map((client) => (
          <ClientCard
            key={client.client_id}
            clientId={client.client_id}
            name={client.full_name}
            phone={client.phone}
            lastVisitAt={client.last_visit_at}
            visitsCount={client.visits_count}
            totalSpent={client.total_spent}
          />
        ))}
      </div>
    </div>
  );
}
