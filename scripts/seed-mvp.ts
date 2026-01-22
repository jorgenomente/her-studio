import { createClient } from "@supabase/supabase-js";

import type { Database } from "../types/supabase";

type SeedUser = {
  email: string;
  password: string;
  role: Database["public"]["Enums"]["user_role"];
  canManageAgenda: boolean;
  canManagePayments: boolean;
  canManageStock: boolean;
};

const ORG_ID = "11111111-1111-1111-1111-111111111111";
const BRANCH_ID = "22222222-2222-2222-2222-222222222222";
const SERVICE_IDS = [
  "33333333-3333-3333-3333-333333333331",
  "33333333-3333-3333-3333-333333333332",
];
const BRANCH_SERVICE_IDS = [
  "44444444-4444-4444-4444-444444444441",
  "44444444-4444-4444-4444-444444444442",
];
const STAFF_IDS = [
  "55555555-5555-5555-5555-555555555551",
  "55555555-5555-5555-5555-555555555552",
];
const PRODUCT_IDS = [
  "66666666-6666-6666-6666-666666666661",
  "66666666-6666-6666-6666-666666666662",
];

const AVAILABILITY_IDS: Record<string, string[]> = {
  [STAFF_IDS[0]]: [
    "77777777-7777-7777-7777-777777777701",
    "77777777-7777-7777-7777-777777777702",
    "77777777-7777-7777-7777-777777777703",
    "77777777-7777-7777-7777-777777777704",
    "77777777-7777-7777-7777-777777777705",
  ],
  [STAFF_IDS[1]]: [
    "88888888-8888-8888-8888-888888888801",
    "88888888-8888-8888-8888-888888888802",
    "88888888-8888-8888-8888-888888888803",
    "88888888-8888-8888-8888-888888888804",
    "88888888-8888-8888-8888-888888888805",
  ],
};

const USERS: SeedUser[] = [
  {
    email: "jorgenomente@gmail.com",
    password: "Password123!",
    role: "superadmin",
    canManageAgenda: true,
    canManagePayments: true,
    canManageStock: true,
  },
  {
    email: "pulidop21@gmail.com",
    password: "Password123!",
    role: "admin",
    canManageAgenda: true,
    canManagePayments: true,
    canManageStock: true,
  },
  {
    email: "info.cosmicst@gmail.com",
    password: "Password123!",
    role: "seller",
    canManageAgenda: true,
    canManagePayments: true,
    canManageStock: false,
  },
];

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

async function ensureUser(
  supabaseAdmin: ReturnType<typeof createClient<Database>>,
  user: SeedUser,
) {
  const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (listError) {
    throw new Error(listError.message);
  }

  const existing = listData.users.find(
    (item) => item.email?.toLowerCase() === user.email.toLowerCase(),
  );

  if (existing) {
    return existing;
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new Error(error?.message || "Failed to create user");
  }

  return data.user;
}

async function main() {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl) {
    throw new Error("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL");
  }

  const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { error: orgError } = await supabaseAdmin
    .from("organization")
    .upsert(
      {
        id: ORG_ID,
        name: "Her Studio",
        status: "active",
      },
      { onConflict: "id" },
    );

  if (orgError) {
    throw new Error(orgError.message);
  }

  const { error: branchError } = await supabaseAdmin
    .from("branch")
    .upsert(
      {
        id: BRANCH_ID,
        organization_id: ORG_ID,
        name: "Her Studio Central",
        address: "Av. Corrientes 1234",
        status: "active",
        timezone: "America/Argentina/Buenos_Aires",
      },
      { onConflict: "id" },
    );

  if (branchError) {
    throw new Error(branchError.message);
  }

  const services = [
    {
      id: SERVICE_IDS[0],
      name: "Color & Gloss",
      duration_min: 90,
      price_base: 35000,
      is_active: true,
    },
    {
      id: SERVICE_IDS[1],
      name: "Tratamiento reparador",
      duration_min: 60,
      price_base: 22000,
      is_active: true,
    },
  ];

  const { error: serviceError } = await supabaseAdmin
    .from("service")
    .upsert(services, { onConflict: "id" });

  if (serviceError) {
    throw new Error(serviceError.message);
  }

  const { error: branchServiceError } = await supabaseAdmin
    .from("branch_service")
    .upsert(
      [
        {
          id: BRANCH_SERVICE_IDS[0],
          branch_id: BRANCH_ID,
          service_id: SERVICE_IDS[0],
          is_enabled: true,
          is_available: true,
        },
        {
          id: BRANCH_SERVICE_IDS[1],
          branch_id: BRANCH_ID,
          service_id: SERVICE_IDS[1],
          is_enabled: true,
          is_available: true,
        },
      ],
      { onConflict: "id" },
    );

  if (branchServiceError) {
    throw new Error(branchServiceError.message);
  }

  const { error: staffError } = await supabaseAdmin
    .from("staff")
    .upsert(
      [
        {
          id: STAFF_IDS[0],
          branch_id: BRANCH_ID,
          full_name: "Camila López",
          email: "camila@herstudio.com",
          phone: "+54 11 5555 0101",
          status: "active",
        },
        {
          id: STAFF_IDS[1],
          branch_id: BRANCH_ID,
          full_name: "Valentina Pérez",
          email: "valentina@herstudio.com",
          phone: "+54 11 5555 0102",
          status: "active",
        },
      ],
      { onConflict: "id" },
    );

  if (staffError) {
    throw new Error(staffError.message);
  }

  const availabilityRows = STAFF_IDS.flatMap((staffId) => {
    const ids = AVAILABILITY_IDS[staffId];
    return ids.map((availabilityId, index) => ({
      id: availabilityId,
      staff_id: staffId,
      weekday: index + 1,
      start_time: "09:00:00",
      end_time: "18:00:00",
      is_active: true,
    }));
  });

  const { error: availabilityError } = await supabaseAdmin
    .from("staff_availability")
    .upsert(availabilityRows, { onConflict: "id" });

  if (availabilityError) {
    throw new Error(availabilityError.message);
  }

  const { error: productError } = await supabaseAdmin
    .from("product")
    .upsert(
      [
        {
          id: PRODUCT_IDS[0],
          branch_id: BRANCH_ID,
          name: "Shampoo nutritivo",
          unit: "ml",
          stock_min: 5,
          is_active: true,
        },
        {
          id: PRODUCT_IDS[1],
          branch_id: BRANCH_ID,
          name: "Mascarilla reparadora",
          unit: "ml",
          stock_min: 3,
          is_active: true,
        },
      ],
      { onConflict: "id" },
    );

  if (productError) {
    throw new Error(productError.message);
  }

  const createdUsers = [] as { email: string; id: string }[];

  for (const user of USERS) {
    const authUser = await ensureUser(supabaseAdmin, user);

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          user_id: authUser.id,
          email: user.email,
          full_name: user.email.split("@")[0],
          status: "active",
        },
        { onConflict: "user_id" },
      );

    if (profileError) {
      throw new Error(profileError.message);
    }

    const { error: roleError } = await supabaseAdmin
      .from("user_branch_role")
      .upsert(
        {
          user_id: authUser.id,
          branch_id: BRANCH_ID,
          role: user.role,
          can_manage_agenda: user.canManageAgenda,
          can_manage_payments: user.canManagePayments,
          can_manage_stock: user.canManageStock,
          is_active: true,
        },
        { onConflict: "user_id,branch_id" },
      );

    if (roleError) {
      throw new Error(roleError.message);
    }

    createdUsers.push({ email: user.email, id: authUser.id });
  }

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const exampleStartAt = new Date(
    Date.UTC(
      tomorrow.getUTCFullYear(),
      tomorrow.getUTCMonth(),
      tomorrow.getUTCDate(),
      14,
      0,
      0,
    ),
  ).toISOString();

  console.log("Seed MVP completado\n");
  console.log(`branch_id: ${BRANCH_ID}`);
  console.log(`service_ids: ${SERVICE_IDS.join(", ")}`);
  console.log(`staff_ids: ${STAFF_IDS.join(", ")}`);
  console.log("users:");
  createdUsers.forEach((user) => {
    console.log(`- ${user.email} (${user.id})`);
  });
  console.log("\nEjemplo rpc_public_create_reservation:");
  console.log(
    JSON.stringify(
      {
        p_branch_id: BRANCH_ID,
        p_service_id: SERVICE_IDS[0],
        p_start_at: exampleStartAt,
        p_full_name: "Cliente Demo",
        p_phone: "+54 11 5555 7777",
        p_email: "cliente@demo.com",
        p_staff_strategy: "any",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
