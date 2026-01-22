"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type StaffOption = {
  id: string;
  name: string;
};

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Agendada" },
  { value: "scheduled_deposit_pending", label: "Seña pendiente" },
  { value: "scheduled_deposit_verified", label: "Seña verificada" },
  { value: "in_progress", label: "En curso" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" },
  { value: "no_show", label: "No-show" },
];

export function AgendaFilters({
  staffOptions,
  staffId,
  status,
}: {
  staffOptions: StaffOption[];
  staffId?: string | null;
  status?: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeStaff = useMemo(
    () => staffOptions.find((option) => option.id === staffId) ?? null,
    [staffOptions, staffId],
  );

  const updateParam = (key: string, value?: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`/app/agenda?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs tracking-wide uppercase">
          Staff
        </span>
        {staffOptions.length === 0 ? (
          <Badge variant="outline">Sin staff</Badge>
        ) : (
          <>
            <Button
              size="sm"
              variant={!staffId ? "default" : "outline"}
              onClick={() => updateParam("staff", null)}
            >
              Todos
            </Button>
            {staffOptions.map((option) => (
              <Button
                key={option.id}
                size="sm"
                variant={staffId === option.id ? "default" : "outline"}
                onClick={() => updateParam("staff", option.id)}
              >
                {option.name}
              </Button>
            ))}
          </>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs tracking-wide uppercase">
          Estado
        </span>
        <Button
          size="sm"
          variant={!status ? "default" : "outline"}
          onClick={() => updateParam("status", null)}
        >
          Todos
        </Button>
        {STATUS_OPTIONS.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={status === option.value ? "default" : "outline"}
            onClick={() => updateParam("status", option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      <div className="text-muted-foreground text-xs">
        {activeStaff
          ? `Filtrado por ${activeStaff.name}`
          : "Sin filtro por staff"}
        {status ? ` · Estado: ${status}` : ""}
      </div>
    </div>
  );
}
