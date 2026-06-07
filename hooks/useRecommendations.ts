import { useState, useEffect } from "react";

interface RecommendedQuiz {
  id:             string;
  title:          string;
  difficulty:     string;
  question_count: number;
  cover_image:    string | null;
  category:       { name: string } | null;
}

export function useRecommendations(userId: string | undefined) {
  const [recommendations, setRecommendations] = useState<RecommendedQuiz[]>([]);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState<string | null>(null);

  const fetchRecommendations = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/recommendations", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error("Erreur API");
      const data = await res.json();
      setRecommendations(data.recommendations ?? []);

    } catch (err) {
      setError("Impossible de charger les recommandations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchRecommendations();
  }, [userId]);

  return { recommendations, loading, error, refetch: fetchRecommendations };
}