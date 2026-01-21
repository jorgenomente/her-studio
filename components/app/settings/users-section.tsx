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

type BranchOption = {
  id: string;
  name: string;
};

type UserRow = {
  user_id: string;
  branch_id: string;
  branch_name: string;
  full_name?: string | null;
  email?: string | null;
  role: "admin" | "seller" | "superadmin";
  can_manage_agenda: boolean;
  can_manage_payments: boolean;
  can_manage_stock: boolean;
  is_active: boolean;
};

export function UsersSection({
  users,
  branches,
  onInvite,
  onUpdate,
  inviteToken,
}: {
  users: UserRow[];
  branches: BranchOption[];
  onInvite: (formData: FormData) => Promise<void>;
  onUpdate: (formData: FormData) => Promise<void>;
  inviteToken?: string | null;
}) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const inviteLink =
    inviteToken && origin ? `${origin}/invite/${inviteToken}` : null;

  const grouped = useMemo(() => {
    return users.sort((a, b) => (a.email ?? "").localeCompare(b.email ?? ""));
  }, [users]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Usuarios</h2>
        <Button onClick={() => setIsInviteOpen(true)}>Invitar</Button>
      </div>

      {inviteToken ? (
        <div className="bg-card rounded-xl border p-4 text-sm">
          <p className="text-muted-foreground">Link de invitación generado:</p>
          <p className="mt-2 font-mono text-xs break-all">{inviteLink}</p>
        </div>
      ) : null}

      {grouped.length === 0 ? (
        <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
          No hay usuarios en esta sucursal.
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map((user) => (
            <form
              key={`${user.user_id}-${user.branch_id}`}
              action={onUpdate}
              className="bg-card space-y-3 rounded-xl border p-4"
            >
              <input type="hidden" name="user_id" value={user.user_id} />
              <input type="hidden" name="branch_id" value={user.branch_id} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">
                    {user.full_name ?? user.email ?? "Usuario"}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {user.email ?? "Sin email"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {user.branch_name}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={user.is_active}
                  />
                  Activo
                </label>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <select
                    name="role"
                    className="bg-background h-10 w-full rounded-md border px-3 text-sm"
                    defaultValue={
                      user.role === "superadmin" ? "admin" : user.role
                    }
                  >
                    <option value="admin">Admin</option>
                    <option value="seller">Seller</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Permisos</Label>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="can_manage_agenda"
                        defaultChecked={user.can_manage_agenda}
                      />
                      Agenda
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="can_manage_payments"
                        defaultChecked={user.can_manage_payments}
                      />
                      Pagos
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="can_manage_stock"
                        defaultChecked={user.can_manage_stock}
                      />
                      Stock
                    </label>
                  </div>
                </div>
              </div>
              <Button type="submit" size="sm" variant="outline">
                Guardar cambios
              </Button>
            </form>
          ))}
        </div>
      )}

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Invitar usuario</DialogTitle>
          </DialogHeader>
          <form
            action={onInvite}
            className="space-y-4"
            onSubmit={() => setIsInviteOpen(false)}
          >
            <div className="space-y-2">
              <Label>Email</Label>
              <Input name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label>Nombre (opcional)</Label>
              <Input name="full_name" type="text" />
            </div>
            <div className="space-y-2">
              <Label>Sucursal</Label>
              <select
                name="branch_id"
                className="bg-background h-10 w-full rounded-md border px-3 text-sm"
                required
              >
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <select
                name="role"
                className="bg-background h-10 w-full rounded-md border px-3 text-sm"
                defaultValue="seller"
              >
                <option value="admin">Admin</option>
                <option value="seller">Seller</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="can_manage_agenda" />
                Agenda
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="can_manage_payments" />
                Pagos
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="can_manage_stock" />
                Stock
              </label>
            </div>
            <Button type="submit" className="w-full">
              Generar invitación
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
