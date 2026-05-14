"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { message } from "antd";

interface Option {
  id: string;
  text: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  text: string;
  type: string;
  difficulty: string;
  explanation: string;
  options: Option[];
}

interface PendingQuiz {
  id: string;
  title: string;
  difficulty: string;
  question_count: number;
  created_at: string;
  rejection_reason: string | null;
  creator_name: string | null;
  creator_id: string;
  ai_score?: number;
  ai_remarks?: string[];
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Hard:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function AdminPendingQuizzesPage() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<PendingQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Preview modal
  const [previewQuiz, setPreviewQuiz] = useState<PendingQuiz | null>(null);
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pending");
      const data = await res.json();
      if (!res.ok) {
        message.error(data?.error ?? "Erreur lors du chargement.");
        setQuizzes([]);
        return;
      }
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error("Erreur lors du chargement.");
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Preview ────────────────────────────────────────────────────────────────
  const handlePreview = async (quiz: PendingQuiz) => {
    setPreviewQuiz(quiz);
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/admin/quiz-questions?quizId=${quiz.id}`);
      const data = await res.json();
      setPreviewQuestions(Array.isArray(data) ? data : []);
    } catch {
      message.error("Erreur lors du chargement des questions.");
      setPreviewQuestions([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  // ── Approuver ─────────────────────────────────────────────────────────────
  const handleApprove = async (quizId: string, creatorId: string, quizTitle: string) => {
    setActionLoading(quizId);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, creatorId, quizTitle, adminId: user?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Erreur");
      message.success("Quiz approuvé et publié !");
      setQuizzes(prev => prev.filter(q => q.id !== quizId));
      setPreviewQuiz(null);
    } catch (err: any) {
      message.error(err.message ?? "Erreur lors de l'approbation.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Rejeter ───────────────────────────────────────────────────────────────
  const handleReject = async (quizId: string, creatorId: string, quizTitle: string) => {
    if (!rejectReason.trim()) { message.warning("Entrez une raison de rejet."); return; }
    setActionLoading(quizId);
    try {
      const res = await fetch("/api/admin/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, creatorId, quizTitle, rejectReason, adminId: user?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Erreur");
      message.success("Quiz rejeté.");
      setQuizzes(prev => prev.filter(q => q.id !== quizId));
      setRejectModal(null);
      setRejectReason("");
      setPreviewQuiz(null);
    } catch (err: any) {
      message.error(err.message ?? "Erreur lors du rejet.");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Quiz en attente de validation
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
            {quizzes.length} quiz en attente de review
          </p>
        </div>
        <button
          onClick={fetchPending}
          className="px-4 py-2 text-sm font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-all"
        >
          🔄 Actualiser
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 py-20 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-base font-semibold text-gray-900 dark:text-white">Aucun quiz en attente</p>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Tous les quiz ont été traités</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Info quiz — cliquable pour preview */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => handlePreview(quiz)}
                >
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white truncate hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                      {quiz.title}
                    </h2>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${DIFFICULTY_COLORS[quiz.difficulty] ?? "bg-gray-100 text-gray-600"}`}>
                      {quiz.difficulty}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      ⏳ En attente
                    </span>
                    {quiz.ai_score !== undefined && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        🤖 Score IA : {quiz.ai_score}/100
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400 flex-wrap">
                    <span>👤 {quiz.creator_name ?? "Anonyme"}</span>
                    <span>📝 {quiz.question_count} questions</span>
                    <span>🕐 {formatDate(quiz.created_at)}</span>
                    <span className="text-cyan-500 text-xs font-medium">👁 Cliquer pour voir les questions</span>
                  </div>

                  {quiz.ai_remarks && quiz.ai_remarks.length > 0 && (
                    <div className="mt-3 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
                      <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-1">🤖 Remarques de l'IA :</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {quiz.ai_remarks.map((r, i) => (
                          <li key={i} className="text-xs text-yellow-600 dark:text-yellow-300">{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {quiz.rejection_reason && (
                    <div className="mt-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                      <p className="text-xs text-red-600 dark:text-red-400">
                        <span className="font-semibold">Rejeté par l'IA : </span>{quiz.rejection_reason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(quiz.id, quiz.creator_id, quiz.title)}
                    disabled={actionLoading === quiz.id}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === quiz.id ? "..." : "✅ Approuver"}
                  </button>
                  <button
                    onClick={() => { setRejectModal(quiz.id); setRejectReason(""); }}
                    disabled={actionLoading === quiz.id}
                    className="px-5 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-sm font-semibold border border-red-200 dark:border-red-800 transition-all disabled:opacity-50"
                  >
                    ❌ Rejeter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Preview Modal ─────────────────────────────────────────────────── */}
      {previewQuiz && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{previewQuiz.title}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${DIFFICULTY_COLORS[previewQuiz.difficulty] ?? ""}`}>
                    {previewQuiz.difficulty}
                  </span>
                  <span className="text-xs text-gray-400">👤 {previewQuiz.creator_name ?? "Anonyme"}</span>
                  <span className="text-xs text-gray-400">📝 {previewQuiz.question_count} questions</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApprove(previewQuiz.id, previewQuiz.creator_id, previewQuiz.title)}
                  disabled={actionLoading === previewQuiz.id}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all disabled:opacity-50"
                >
                  ✅ Approuver
                </button>
                <button
                  onClick={() => { setRejectModal(previewQuiz.id); setRejectReason(""); }}
                  className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 dark:text-red-400 text-sm font-semibold border border-red-200 dark:border-red-800 transition-all"
                >
                  ❌ Rejeter
                </button>
                <button
                  onClick={() => { setPreviewQuiz(null); setPreviewQuestions([]); }}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* AI Remarks in modal */}
            {previewQuiz.ai_remarks && previewQuiz.ai_remarks.length > 0 && (
              <div className="mx-6 mt-4 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800">
                <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-1">🤖 Raisons du rejet IA :</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {previewQuiz.ai_remarks.map((r, i) => (
                    <li key={i} className="text-xs text-yellow-600 dark:text-yellow-300">{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Questions list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {previewLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : previewQuestions.length === 0 ? (
                <div className="text-center py-10 text-gray-400">Aucune question trouvée</div>
              ) : (
                previewQuestions.map((q, index) => (
                  <div key={q.id} className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-cyan-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{q.text || <span className="text-red-400 italic">Question vide ⚠️</span>}</p>
                    </div>

                    {/* Options */}
                    <div className="ml-10 space-y-2">
                      {q.options && q.options.length > 0 ? (
                        q.options.map((opt) => (
                          <div
                            key={opt.id}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                              opt.is_correct
                                ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                                : "bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            <span>{opt.is_correct ? "✅" : "○"}</span>
                            <span>{opt.text || <span className="text-red-400 italic">Option vide ⚠️</span>}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-red-400 italic">⚠️ Aucune option pour cette question</p>
                      )}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="ml-10 mt-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <p className="text-xs text-blue-600 dark:text-blue-300">
                          <span className="font-semibold">💡 Explication : </span>{q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal rejet ───────────────────────────────────────────────────── */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              ❌ Raison du rejet
            </h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Expliquez pourquoi ce quiz est rejeté..."
              rows={4}
              className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  const quiz = quizzes.find(q => q.id === rejectModal);
                  if (quiz) handleReject(quiz.id, quiz.creator_id, quiz.title);
                }}
                disabled={!rejectReason.trim() || actionLoading === rejectModal}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-50"
              >
                {actionLoading === rejectModal ? "..." : "Confirmer le rejet"}
              </button>
              <button
                onClick={() => { setRejectModal(null); setRejectReason(""); }}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}