import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");

    if (!quizId) {
      return NextResponse.json({ error: "quizId requis" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("questions")
      .select(`
        id,
        text,
        type,
        difficulty,
        indice,
        options (
          id,
          text,
          is_correct
        )
      `)
      .eq("quiz_id", quizId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}