"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PublicStaff } from "@/lib/queries/public";
import { cn } from "@/lib/utils";

const staffStrategyOptions = [
  { value: "any", label: "Cualquiera disponible" },
  { value: "explicit", label: "Elegir profesional" },
];

type Slot = {
  start_at: string | null;
  end_at: string | null;
  staff_id: string | null;
  staff_name: string | null;
};

export function BookingDateSelector({
  branchId,
  serviceId,
  staff,
}: {
  branchId: string;
  serviceId: string;
  staff: PublicStaff[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStrategy = (() => {
    const pref = searchParams.get("staff_strategy");
    return pref === "explicit" || pref === "any" ? pref : "any";
  })();
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [staffStrategy, setStaffStrategy] = useState(initialStrategy);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);

  const fetchSlots = useCallback(async () => {
    if (!date) {
      return;
    }
    let isActive = true;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/public/availability?branch_id=${branchId}&service_id=${serviceId}&date=${date}`,
      );
      const data = await response.json();
      if (!isActive) return;
      if (data.error) {
        setError("No pudimos cargar disponibilidad.");
        setSlots([]);
        return;
      }
      setSlots(data.slots ?? []);
    } catch {
      if (!isActive) return;
      setError("No pudimos cargar disponibilidad.");
      setSlots([]);
    } finally {
      if (!isActive) return;
      setLoading(false);
    }
    return () => {
      isActive = false;
    };
  }, [branchId, date, serviceId]);

  useEffect(() => {
    void fetchSlots();
  }, [fetchSlots]);

  const filteredSlots = useMemo(() => {
    if (staffStrategy === "explicit" && staffId) {
      return slots.filter((slot) => slot.staff_id === staffId);
    }
    return slots;
  }, [slots, staffId, staffStrategy]);

  const groupedSlots = useMemo(() => {
    const map = new Map<string, Slot[]>();
    filteredSlots.forEach((slot) => {
      if (!slot.start_at) return;
      const key = slot.start_at;
      const list = map.get(key) ?? [];
      list.push(slot);
      map.set(key, list);
    });
    return map;
  }, [filteredSlots]);

  const timeOptions = Array.from(groupedSlots.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  const canContinue = Boolean(selectedStart);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Fecha</Label>
        <Input
          type="date"
          value={date}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(event) => {
            setDate(event.target.value);
            setSelectedStart(null);
          }}
        />
      </div>

      <div className="space-y-3">
        <Label>Profesional</Label>
        <div className="grid gap-3">
          {staffStrategyOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setStaffStrategy(option.value);
                setSelectedStart(null);
                if (option.value === "any") {
                  setStaffId(null);
                }
              }}
              className={cn(
                "w-full rounded-2xl border px-4 py-3 text-left text-sm transition",
                staffStrategy === option.value
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        {staffStrategy === "explicit" ? (
          <div className="grid gap-3 md:grid-cols-2">
            {staff.map((member) => (
              <button
                key={member.staff_id}
                type="button"
                onClick={() => {
                  setStaffId(member.staff_id);
                  setSelectedStart(null);
                }}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left text-sm",
                  staffId === member.staff_id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card",
                )}
              >
                {member.staff_name || "Profesional"}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        <Label>Horarios disponibles</Label>
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="h-12 rounded-2xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : null}
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
        {!loading && !error && timeOptions.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
            No hay horarios disponibles para esa fecha.
          </div>
        ) : null}
        {!loading && !error && timeOptions.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {timeOptions.map(([time, options]) => {
              const formatted = new Date(time).toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const label =
                staffStrategy === "any"
                  ? `${formatted} · ${options.length} disponibles`
                  : formatted;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedStart(time)}
                  className={cn(
                    "rounded-2xl border px-3 py-3 text-sm",
                    selectedStart === time
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <Button
        className="w-full"
        disabled={!canContinue}
        onClick={() => {
          if (!selectedStart) return;
          const params = new URLSearchParams({
            branch_id: branchId,
            service_id: serviceId,
            start_at: selectedStart,
            staff_strategy: staffStrategy,
          });
          if (staffStrategy === "explicit" && staffId) {
            params.set("staff_id", staffId);
          }
          router.push(`/reservar/confirmacion?${params.toString()}`);
        }}
      >
        Continuar
      </Button>
    </div>
  );
}
