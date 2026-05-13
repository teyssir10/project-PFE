import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { quizId, creatorId, quizTitle, rejectReason, adminId } = await req.json();

    const { error } = await supabaseAdmin
      .from("quizzes")
      .update({
        status: "rejected",
        is_published: false,
        rejection_reason: rejectReason,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", quizId);

    if (error) throw error;

    await supabaseAdmin.from("notifications").insert({
      user_id: creatorId,
      title: "❌ Quiz rejeté",
      message: `Votre quiz "${quizTitle}" a été rejeté. Raison : ${rejectReason}`,
      type: "quiz_rejected",
      sent_by: adminId,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}