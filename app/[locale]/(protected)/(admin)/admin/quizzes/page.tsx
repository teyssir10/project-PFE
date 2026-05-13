"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Quiz {
  id: string;
  title: string;
  difficulty: string;
  players: number;
  is_published: boolean;
  created_at: string;
  question_count: number;
  categories: { name: string; icon: string } | null;
}

const diffColors: Record<string, string> = {
  Easy:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  Hard:   "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState("all");
  const [pubFilter, setPubFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => { fetchQuizzes(); }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("quizzes")
      .select("id, title, difficulty, players, is_published, created_at, question_count, categories(name, icon)")
      .order("created_at", { ascending: false });
    setQuizzes(data ?? []);
    setLoading(false);
  };

  const togglePublish = async (quizId: string, current: boolean) => {
    setUpdating(quizId);
    await supabase.from("quizzes").update({ is_published: !current }).eq("id", quizId);
    setQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, is_published: !current } : q));
    setUpdating(null);
  };

  const deleteQuiz = async (quizId: string) => {
    if (!confirm("Supprimer ce quiz ?")) return;
    await supabase.from("quizzes").delete().eq("id", quizId);
    setQuizzes(prev => prev.filter(q => q.id !== quizId));
  };

  const filtered = quizzes.filter(q => {
    const matchSearch = !search || q.title.toLowerCase().includes(search.toLowerCase());
    const matchDiff = diffFilter === "all" || q.difficulty === diffFilter;
    const matchPub = pubFilter === "all" || (pubFilter === "published" ? q.is_published : !q.is_published);
    return matchSearch && matchDiff && matchPub;
  });

  return (
    <div className="space-y-6">
     
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Quiz</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{quizzes.length} quiz au total</p>
      </div>

    
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un quiz..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)}
          className="px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer">
          <option value="all">Toutes difficultés</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <select value={pubFilter} onChange={e => setPubFilter(e.target.value)}
          className="px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer">
          <option value="all">Tous les statuts</option>
          <option value="published">Publiés</option>
          <option value="draft">Brouillons</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
     
        <div className="grid grid-cols-12 px-5 py-3 bg-gray-50 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-700">
          {[
            { label: "Quiz",       cls: "col-span-4" },
            { label: "Catégorie",  cls: "col-span-2 text-center" },
            { label: "Difficulté", cls: "col-span-1 text-center" },
            { label: "Questions",  cls: "col-span-1 text-center" },
            { label: "Joueurs",    cls: "col-span-1 text-center" },
            { label: "Statut",     cls: "col-span-1 text-center" },
            { label: "Actions",    cls: "col-span-2 text-center" },
          ].map(({ label, cls }) => (
            <div key={label} className={`${cls} text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500`}>{label}</div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 dark:text-slate-500 text-sm">Aucun quiz trouvé</div>
        ) : (
          filtered.map(q => (
            <div key={q.id} className="grid grid-cols-12 px-5 py-4 items-center border-b border-gray-100 dark:border-slate-800 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
             
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-lg flex-shrink-0">
                  {q.categories?.icon ?? "🎯"}
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{q.title}</p>
              </div>

              
              <div className="col-span-2 text-center">
                <span className="text-xs text-gray-500 dark:text-slate-400">{q.categories?.name ?? "—"}</span>
              </div>

         
              <div className="col-span-1 text-center">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${diffColors[q.difficulty] ?? "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300"}`}>
                  {q.difficulty}
                </span>
              </div>

          
              <div className="col-span-1 text-center">
                <span className="text-sm text-gray-700 dark:text-slate-300">{q.question_count ?? 0}</span>
              </div>

         
              <div className="col-span-1 text-center">
                <span className="text-sm text-gray-700 dark:text-slate-300">{q.players ?? 0}</span>
              </div>

            
              <div className="col-span-1 text-center">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  q.is_published
                    ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400"
                    : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400"
                }`}>
                  {q.is_published ? "Publié" : "Brouillon"}
                </span>
              </div>

            
              <div className="col-span-2 flex items-center justify-center gap-2">
                <button
                  onClick={() => togglePublish(q.id, q.is_published)}
                  disabled={updating === q.id}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    q.is_published
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      : "bg-cyan-50 text-cyan-600 hover:bg-cyan-100 dark:bg-cyan-500/20 dark:text-cyan-400 dark:hover:bg-cyan-500/30"
                  }`}
                >
                  {updating === q.id ? "..." : q.is_published ? "Dépublier" : "Publier"}
                </button>
                <button
                  onClick={() => deleteQuiz(q.id)}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-all"
                >
                  Suppr.
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}