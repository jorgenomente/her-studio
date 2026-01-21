"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { Input } from "@/components/ui/input";

export function ClientsSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  const handleChange = (next: string) => {
    setValue(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next) {
      params.set("q", next);
    } else {
      params.delete("q");
    }
    startTransition(() => {
      router.replace(`/app/clientes?${params.toString()}`);
    });
  };

  return (
    <div className="bg-background/95 sticky top-14 z-30 rounded-xl border p-3 shadow-sm backdrop-blur">
      <Input
        placeholder="Buscar por nombre o teléfono"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        aria-label="Buscar clientes"
      />
      {isPending ? (
        <p className="text-muted-foreground mt-2 text-xs">Buscando...</p>
      ) : null}
    </div>
  );
}
