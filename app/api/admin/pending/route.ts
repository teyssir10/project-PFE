import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("quizzes")
    .select("id, title, difficulty, question_count, created_at, rejection_reason, creator_name, creator_id, ai_score, ai_remarks")
    .eq("status", "pending_admin")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}