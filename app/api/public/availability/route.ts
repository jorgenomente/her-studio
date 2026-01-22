import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get("branch_id");
  const serviceId = searchParams.get("service_id");
  const date = searchParams.get("date");

  if (!branchId || !serviceId || !date) {
    return NextResponse.json(
      { error: "missing_params" },
      {
        status: 400,
      },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("rpc_public_availability_day", {
    p_branch_id: branchId,
    p_service_id: serviceId,
    p_date: date,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      {
        status: 400,
      },
    );
  }

  return NextResponse.json({ slots: data ?? [] });
}
