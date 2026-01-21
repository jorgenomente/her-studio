"use client";

import { createContext, useContext } from "react";

type Branch = {
  id: string;
  name: string;
  status?: string | null;
};

type BranchRole = {
  branch_id: string;
  role: "superadmin" | "admin" | "seller";
  can_manage_agenda: boolean;
  can_manage_payments: boolean;
  can_manage_stock: boolean;
  is_active: boolean;
};

type PermissionSet = {
  role: "superadmin" | "admin" | "seller" | "none";
  canManageAgenda: boolean;
  canManagePayments: boolean;
  canManageStock: boolean;
};

type SessionContextValue = {
  userId: string;
  userEmail?: string | null;
  isSuperadmin: boolean;
  branches: Branch[];
  branchRoles: BranchRole[];
  activeBranchId: string | null;
  permissions: PermissionSet;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  value,
  children,
}: {
  value: SessionContextValue;
  children: React.ReactNode;
}) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within SessionProvider");
  }
  return context;
}
