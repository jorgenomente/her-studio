"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ServiceRow = {
  service_id: string;
  service_name: string;
  duration_min: number;
  price_base: number;
  is_active: boolean;
  is_enabled: boolean;
  is_available: boolean;
};

export function ServicesSection({
  services,
  onUpdate,
}: {
  services: ServiceRow[];
  onUpdate: (formData: FormData) => Promise<void>;
}) {
  const [query, setQuery] = useState("");

  const filtered = services.filter((service) =>
    service.service_name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input
          placeholder="Buscar servicio"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
          No hay servicios para esta búsqueda.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((service) => (
            <form
              key={service.service_id}
              action={onUpdate}
              className="bg-card space-y-3 rounded-xl border p-4"
            >
              <input
                type="hidden"
                name="service_id"
                value={service.service_id}
              />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">
                    {service.service_name}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {service.duration_min} min · ${service.price_base}
                  </p>
                </div>
                <span className="text-muted-foreground text-xs">
                  {service.is_active ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="is_enabled"
                    defaultChecked={service.is_enabled}
                  />
                  Habilitado
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="is_available"
                    defaultChecked={service.is_available}
                  />
                  Disponible
                </label>
                <Button type="submit" size="sm" variant="outline">
                  Guardar
                </Button>
              </div>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
