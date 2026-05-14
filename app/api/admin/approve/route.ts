import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { quizId, creatorId, quizTitle, adminId } = await req.json();

    const { error } = await supabaseAdmin
      .from("quizzes")
      .update({
        status: "published",
        is_published: true,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: null,
      })
      .eq("id", quizId);

    if (error) throw error;

    await supabaseAdmin.from("notifications").insert({
      user_id: creatorId,
      title: "✅ Quiz approuvé !",
      message: `Votre quiz "${quizTitle}" a été approuvé par l'admin et est maintenant publié.`,
      type: "quiz_approved",
      sent_by: adminId,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}