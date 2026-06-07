import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ recommendations: [] });

    // 1. Récupérer l'historique avec les scores
    const { data: history } = await supabase
      .from("quiz_history")
      .select("quiz_id, score")
      .eq("user_id", userId);

    // 2. Extraire les IDs déjà joués
    const playedIds = [...new Set(
      history?.map(h => h.quiz_id).filter(Boolean) ?? []
    )];

    // 3. Calculer le score moyen
    const avgScore = history?.length
      ? history.reduce((sum, h) => sum + (h.score ?? 0), 0) / history.length
      : 0;

    // 4. Déterminer la difficulté adaptée
    const difficulty = avgScore >= 70 ? "Hard"
      : avgScore >= 40 ? "Medium"
      : "Easy";

    console.log("avgScore:", avgScore, "→ difficulty:", difficulty);

    // 5. Récupérer tous les quiz publiés
    const { data: allQuizzes } = await supabase
      .from("quizzes")
      .select(`
        id,
        title,
        difficulty,
        question_count,
        cover_image,
        category:categories(name)
      `)
      .eq("is_published", true);

    // 6. Filtrer : non joués + bonne difficulté
    let recommendations = (allQuizzes ?? [])
      .filter(q => !playedIds.includes(q.id))
      .filter(q => q.difficulty === difficulty)
      .slice(0, 3);

    // 7. Fallback si pas assez de résultats
    if (recommendations.length < 3) {
      const fallback = (allQuizzes ?? [])
        .filter(q => !playedIds.includes(q.id))
        .filter(q => !recommendations.find(r => r.id === q.id))
        .slice(0, 3 - recommendations.length);

      recommendations = [...recommendations, ...fallback];
    }

    return NextResponse.json({ recommendations });

  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}