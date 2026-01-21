import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppNav } from "@/components/app/app-nav";
import { BranchSelector } from "@/components/app/branch-selector";
import { SessionProvider } from "@/components/app/session-context";
import { UserMenu } from "@/components/app/user-menu";
import { Separator } from "@/components/ui/separator";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Branch = {
  id: string;
  name: string;
  status: string | null;
};

type BranchRole = {
  branch_id: string;
  role: "superadmin" | "admin" | "seller";
  can_manage_agenda: boolean;
  can_manage_payments: boolean;
  can_manage_stock: boolean;
  is_active: boolean;
};

function resolvePermissions({
  isSuperadmin,
  branchRoles,
  activeBranchId,
}: {
  isSuperadmin: boolean;
  branchRoles: BranchRole[];
  activeBranchId: string | null;
}) {
  if (isSuperadmin) {
    return {
      role: "superadmin" as const,
      canManageAgenda: true,
      canManagePayments: true,
      canManageStock: true,
    };
  }

  const activeRole = branchRoles.find(
    (role) => role.branch_id === activeBranchId,
  );

  if (!activeRole) {
    return {
      role: "none" as const,
      canManageAgenda: false,
      canManagePayments: false,
      canManageStock: false,
    };
  }

  if (activeRole.role === "admin") {
    return {
      role: "admin" as const,
      canManageAgenda: true,
      canManagePayments: true,
      canManageStock: true,
    };
  }

  return {
    role: "seller" as const,
    canManageAgenda: activeRole.can_manage_agenda,
    canManagePayments: activeRole.can_manage_payments,
    canManageStock: activeRole.can_manage_stock,
  };
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: branchRolesRaw } = await supabase
    .from("user_branch_role")
    .select(
      "branch_id, role, can_manage_agenda, can_manage_payments, can_manage_stock, is_active",
    )
    .eq("user_id", user.id)
    .eq("is_active", true);

  const branchRoles = (branchRolesRaw ?? []) as BranchRole[];
  const isSuperadmin = branchRoles.some((role) => role.role === "superadmin");

  let branches: Branch[] = [];
  if (isSuperadmin) {
    const { data } = await supabase
      .from("branch")
      .select("id, name, status")
      .eq("status", "active");
    branches = (data ?? []) as Branch[];
  } else if (branchRoles.length > 0) {
    const branchIds = branchRoles.map((role) => role.branch_id);
    const { data } = await supabase
      .from("branch")
      .select("id, name, status")
      .in("id", branchIds)
      .eq("status", "active");
    branches = (data ?? []) as Branch[];
  }

  const cookieStore = cookies();
  const cookieBranchId = cookieStore.get("hs_branch_id")?.value ?? null;
  const hasBranch =
    cookieBranchId && branches.some((branch) => branch.id === cookieBranchId);
  const activeBranchId = hasBranch ? cookieBranchId : (branches[0]?.id ?? null);

  if (activeBranchId && activeBranchId !== cookieBranchId) {
    cookieStore.set("hs_branch_id", activeBranchId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  }

  const permissions = resolvePermissions({
    isSuperadmin,
    branchRoles,
    activeBranchId,
  });
  const showBranchSelector = isSuperadmin || branches.length > 1;

  const navItems = [
    (permissions.role === "admin" || permissions.role === "superadmin") && {
      href: "/app/dashboard",
      label: "Dashboard",
    },
    permissions.canManageAgenda && { href: "/app/agenda", label: "Agenda" },
    permissions.canManagePayments && { href: "/app/pos", label: "POS" },
    (permissions.canManageAgenda || permissions.canManagePayments) && {
      href: "/app/clientes",
      label: "Clientes",
    },
    permissions.canManageStock && { href: "/app/stock", label: "Stock" },
    permissions.canManageStock && { href: "/app/compras", label: "Compras" },
    (permissions.role === "admin" || permissions.role === "superadmin") && {
      href: "/app/reportes",
      label: "Reportes",
    },
    (permissions.role === "admin" || permissions.role === "superadmin") && {
      href: "/app/configuracion",
      label: "Configuracion",
    },
  ].filter(Boolean) as { href: string; label: string }[];

  async function setActiveBranch(formData: FormData) {
    "use server";
    const branchId = formData.get("branch_id")?.toString();
    if (!branchId) {
      return;
    }
    cookies().set("hs_branch_id", branchId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return (
    <SessionProvider
      value={{
        userId: user.id,
        userEmail: user.email,
        isSuperadmin,
        branches,
        branchRoles,
        activeBranchId,
        permissions,
      }}
    >
      <div className="bg-muted/30 min-h-screen">
        <header className="bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <p className="text-muted-foreground text-xs tracking-wide uppercase">
                Her Studio
              </p>
              <h1 className="text-lg font-semibold">Operations</h1>
            </div>
            <div className="flex items-center gap-2">
              {showBranchSelector ? (
                <BranchSelector
                  branches={branches}
                  activeBranchId={activeBranchId}
                  onSelectBranch={setActiveBranch}
                />
              ) : null}
              <UserMenu email={user.email} />
            </div>
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-64px)]">
          <aside className="bg-background hidden w-56 border-r md:block">
            <AppNav items={navItems} />
          </aside>
          <main className="flex-1 px-4 py-6 pb-20 md:pb-6">
            {branches.length === 0 ? (
              <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
                No branches assigned yet. Ask an admin to grant access.
              </div>
            ) : (
              children
            )}
          </main>
        </div>

        <div className="bg-background fixed right-0 bottom-0 left-0 border-t md:hidden">
          <AppNav items={navItems} />
          <Separator />
        </div>
      </div>
    </SessionProvider>
  );
}
