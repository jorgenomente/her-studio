import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { StaffSection } from "@/components/app/settings/staff-section";
import { ServicesSection } from "@/components/app/settings/services-section";
import { UsersSection } from "@/components/app/settings/users-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createInviteAction,
  createStaffAction,
  setBranchServiceStateAction,
  setStaffAvailabilityAction,
  updateStaffAction,
  updateUserBranchRoleAction,
} from "@/lib/actions/settings";
import {
  fetchBranchServices,
  fetchBranches,
  fetchStaffAvailability,
  fetchStaffList,
  fetchUsersList,
} from "@/lib/queries/settings";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SearchParams = {
  success?: string;
  error?: string;
  token?: string;
};

type BranchRole = {
  branch_id: string;
  role: "superadmin" | "admin" | "seller";
  is_active: boolean;
};

export default async function ConfiguracionPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const cookieStore = await cookies();
  const activeBranchId = cookieStore.get("hs_branch_id")?.value ?? null;

  if (!activeBranchId) {
    return (
      <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
        Selecciona una sucursal para ver configuración.
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: branchRolesRaw } = await supabase
    .from("user_branch_role")
    .select("branch_id, role, is_active")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const branchRoles = (branchRolesRaw ?? []) as BranchRole[];
  const isSuperadmin = branchRoles.some((role) => role.role === "superadmin");
  const isAdmin = branchRoles.some((role) => role.role === "admin");

  if (!isSuperadmin && !isAdmin) {
    return (
      <div className="bg-card text-muted-foreground rounded-xl border border-dashed p-6 text-sm">
        Sin permisos para acceder a configuración.
      </div>
    );
  }

  const allBranches = (await fetchBranches()) as { id: string; name: string; status?: string | null }[];
  const accessibleBranchIds = isSuperadmin
    ? allBranches.map((branch) => branch.id)
    : branchRoles.map((role) => role.branch_id);

  const [staff, availability, services, users] = (await Promise.all([
    fetchStaffList({ branchId: activeBranchId }),
    fetchStaffAvailability({ branchId: activeBranchId }),
    fetchBranchServices({ branchId: activeBranchId }),
    fetchUsersList({ branchIds: accessibleBranchIds }),
  ])) as [
    {
      staff_id: string;
      branch_id: string;
      full_name: string;
      email?: string | null;
      phone?: string | null;
      status: string;
    }[],
    {
      staff_id: string;
      weekday: number;
      start_time: string | null;
      end_time: string | null;
      is_active: boolean;
    }[],
    {
      service_id: string;
      service_name: string;
      duration_min: number;
      price_base: number;
      is_active: boolean;
      is_enabled: boolean;
      is_available: boolean;
    }[],
    {
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
    }[],
  ];

  const branches = isSuperadmin
    ? allBranches
    : allBranches.filter((branch) => accessibleBranchIds.includes(branch.id));

  return (
    <div className="space-y-4">
      {searchParams.success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Operación guardada correctamente.
        </div>
      ) : null}
      {searchParams.error ? (
        <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-xl border p-4 text-sm">
          {searchParams.error}
        </div>
      ) : null}

      <Tabs defaultValue="staff">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:grid-cols-4">
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          {isSuperadmin ? (
            <TabsTrigger value="branches">Sucursales</TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <StaffSection
            staff={staff}
            availability={availability}
            onCreateStaff={createStaffAction}
            onUpdateStaff={updateStaffAction}
            onSetAvailability={setStaffAvailabilityAction}
          />
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <ServicesSection
            services={services}
            onUpdate={setBranchServiceStateAction}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UsersSection
            users={users}
            branches={branches}
            onInvite={createInviteAction}
            onUpdate={updateUserBranchRoleAction}
            inviteToken={searchParams.token ?? null}
          />
        </TabsContent>

        {isSuperadmin ? (
          <TabsContent value="branches" className="space-y-4">
            <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
              Gestión de sucursales (próximo ticket).
            </div>
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}
