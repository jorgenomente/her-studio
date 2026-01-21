import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const appointmentId = formData.get("appointment_id")?.toString();
  const file = formData.get("file");

  if (!appointmentId || !(file instanceof File)) {
    return NextResponse.json(
      { error: "invalid_payload" },
      {
        status: 400,
      },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "missing_supabase_env" },
      {
        status: 500,
      },
    );
  }

  const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: appointment, error: appointmentError } = await supabaseAdmin
    .from("appointment")
    .select("id, branch_id, status")
    .eq("id", appointmentId)
    .maybeSingle();

  if (appointmentError || !appointment) {
    return NextResponse.json(
      { error: "appointment_not_found" },
      {
        status: 404,
      },
    );
  }

  const extension = file.name.split(".").pop() || "jpg";
  const path = `branch/${appointment.branch_id}/appointment/${appointment.id}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("deposit-proofs")
    .upload(path, file, {
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: uploadError.message },
      {
        status: 400,
      },
    );
  }

  return NextResponse.json({ proof_path: path });
}
