"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Staff = {
  staff_id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  status: string;
};

type Availability = {
  staff_id: string;
  weekday: number;
  start_time: string | null;
  end_time: string | null;
  is_active: boolean;
};

const WEEKDAYS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

export function StaffSection({
  staff,
  availability,
  onCreateStaff,
  onUpdateStaff,
  onSetAvailability,
}: {
  staff: Staff[];
  availability: Availability[];
  onCreateStaff: (formData: FormData) => Promise<void>;
  onUpdateStaff: (formData: FormData) => Promise<void>;
  onSetAvailability: (formData: FormData) => Promise<void>;
}) {
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [availabilityStaff, setAvailabilityStaff] = useState<Staff | null>(
    null,
  );

  const availabilityMap = useMemo(() => {
    const map = new Map<string, Availability[]>();
    availability.forEach((slot) => {
      const list = map.get(slot.staff_id) ?? [];
      list.push(slot);
      map.set(slot.staff_id, list);
    });
    return map;
  }, [availability]);

  const [draftAvailability, setDraftAvailability] = useState(() =>
    WEEKDAYS.map((day) => ({
      weekday: day.value,
      start_time: "09:00",
      end_time: "18:00",
      is_active: false,
    })),
  );

  const openCreateModal = () => {
    setEditingStaff(null);
    setIsStaffModalOpen(true);
  };

  const openEditModal = (item: Staff) => {
    setEditingStaff(item);
    setIsStaffModalOpen(true);
  };

  const openAvailability = (item: Staff) => {
    setAvailabilityStaff(item);
    const slots = availabilityMap.get(item.staff_id) ?? [];
    const normalized = WEEKDAYS.map((day) => {
      const slot = slots.find((s) => s.weekday === day.value);
      return {
        weekday: day.value,
        start_time: slot?.start_time ?? "09:00",
        end_time: slot?.end_time ?? "18:00",
        is_active: slot?.is_active ?? false,
      };
    });
    setDraftAvailability(normalized);
    setIsAvailabilityOpen(true);
  };

  const updateDraft = (
    weekday: number,
    updates: Partial<(typeof draftAvailability)[number]>,
  ) => {
    setDraftAvailability((prev) =>
      prev.map((slot) =>
        slot.weekday === weekday ? { ...slot, ...updates } : slot,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Staff</h2>
        <Button onClick={openCreateModal}>Nuevo staff</Button>
      </div>

      {staff.length === 0 ? (
        <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
          No hay staff cargado en esta sucursal.
        </div>
      ) : (
        <div className="space-y-3">
          {staff.map((item) => (
            <div key={item.staff_id} className="bg-card rounded-xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{item.full_name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {item.email ?? "Sin email"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {item.phone ?? "Sin teléfono"}
                  </p>
                </div>
                <span className="rounded-full border px-3 py-1 text-xs">
                  {item.status === "active" ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(item)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openAvailability(item)}
                >
                  Disponibilidad
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isStaffModalOpen} onOpenChange={setIsStaffModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? "Editar staff" : "Nuevo staff"}
            </DialogTitle>
          </DialogHeader>
          <form
            action={editingStaff ? onUpdateStaff : onCreateStaff}
            className="space-y-4"
            onSubmit={() => setIsStaffModalOpen(false)}
          >
            {editingStaff ? (
              <input
                type="hidden"
                name="staff_id"
                value={editingStaff.staff_id}
              />
            ) : null}
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                name="full_name"
                defaultValue={editingStaff?.full_name ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                defaultValue={editingStaff?.email ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                name="phone"
                type="tel"
                defaultValue={editingStaff?.phone ?? ""}
              />
            </div>
            {editingStaff ? (
              <div className="space-y-2">
                <Label>Estado</Label>
                <select
                  name="status"
                  className="bg-background h-10 w-full rounded-md border px-3 text-sm"
                  defaultValue={editingStaff.status}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            ) : null}
            <Button type="submit" className="w-full">
              Guardar
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAvailabilityOpen} onOpenChange={setIsAvailabilityOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Disponibilidad semanal</DialogTitle>
          </DialogHeader>
          <form
            action={onSetAvailability}
            className="space-y-4"
            onSubmit={() => setIsAvailabilityOpen(false)}
          >
            {availabilityStaff ? (
              <input
                type="hidden"
                name="staff_id"
                value={availabilityStaff.staff_id}
              />
            ) : null}
            <input
              type="hidden"
              name="availability"
              value={JSON.stringify(draftAvailability)}
            />
            <div className="space-y-3">
              {draftAvailability.map((slot) => (
                <div
                  key={slot.weekday}
                  className="space-y-2 rounded-lg border p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {
                        WEEKDAYS.find((day) => day.value === slot.weekday)
                          ?.label
                      }
                    </span>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={slot.is_active}
                        onChange={(event) =>
                          updateDraft(slot.weekday, {
                            is_active: event.target.checked,
                          })
                        }
                      />
                      Activo
                    </label>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Inicio</Label>
                      <Input
                        type="time"
                        value={slot.start_time ?? ""}
                        onChange={(event) =>
                          updateDraft(slot.weekday, {
                            start_time: event.target.value,
                          })
                        }
                        disabled={!slot.is_active}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Fin</Label>
                      <Input
                        type="time"
                        value={slot.end_time ?? ""}
                        onChange={(event) =>
                          updateDraft(slot.weekday, {
                            end_time: event.target.value,
                          })
                        }
                        disabled={!slot.is_active}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button type="submit" className="w-full">
              Guardar disponibilidad
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
