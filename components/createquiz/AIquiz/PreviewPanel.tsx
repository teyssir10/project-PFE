"use client";

import { EyeOutlined, ReloadOutlined, PictureOutlined, LoadingOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { GeneratedQuestion } from "@/hooks/useQuizForm";
import { useState } from "react";

interface PreviewPanelProps {
  loading: boolean;
  questions: GeneratedQuestion[];
  onReset?: () => void;
  quizTitle?: string;
  onImageGenerated?: (url: string) => void;
}

export default function PreviewPanel({ loading, questions, onReset, quizTitle, onImageGenerated }: PreviewPanelProps) {
  const t = useTranslations("aiQuiz");
  const hasQuestions = questions.length > 0;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [retrySeconds, setRetrySeconds] = useState<number | null>(null);
  const [imgRendering, setImgRendering] = useState(false);

  const generateImage = async () => {
    if (!quizTitle) return;
    setImageLoading(true);
    setImageError(null);
    setRetrySeconds(null);
    setImageUrl(null);
    setImgRendering(false);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: quizTitle }),
      });

      const data = await res.json();

      if (res.status === 503 && data.retry) {
        const wait = Math.ceil(data.estimated ?? 20);
        setRetrySeconds(wait);
        setImageLoading(false);
        setTimeout(() => generateImage(), wait * 1000);
        return;
      }

      if (!data.success) throw new Error(data.error ?? "Generation failed.");

      setImgRendering(true);
      setImageUrl(data.imageUrl);
      onImageGenerated?.(data.imageUrl);

    } catch (err: any) {
      setImageError(err.message ?? "Échec de la génération.");
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm min-h-[600px] flex flex-col h-full transition-colors duration-300">

      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-50 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800 flex items-center justify-center text-base">
            <EyeOutlined className="text-violet-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{t("previewTitle")}</p>
            <p className="text-[11px] text-gray-400 dark:text-slate-400">
              {hasQuestions ? `${questions.length} questions générées` : t("previewSub")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full font-medium border ${
            loading
              ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700"
              : hasQuestions
              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700"
              : "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-400 border-gray-200 dark:border-slate-600"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              loading ? "bg-amber-400 animate-pulse"
              : hasQuestions ? "bg-emerald-400"
              : "bg-gray-300 dark:bg-slate-500"
            }`} />
            {loading ? t("statusGenerating") : hasQuestions ? "Prêt" : t("statusWaiting")}
          </span>

          {hasQuestions && onReset && (
            <button onClick={onReset} title="Recommencer"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-all">
              <ReloadOutlined className="text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-6 overflow-y-auto">

        {/* Empty state */}
        {!loading && !hasQuestions && (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/30 dark:to-teal-900/30 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center text-3xl shadow-sm">✨</div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 border-2 border-white dark:border-slate-800" />
            </div>
            <p className="text-gray-700 dark:text-slate-300 font-semibold text-sm mb-1">{t("noQuizYet")}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 max-w-xs leading-relaxed">
              {t("noQuizSub")}{" "}<span className="text-cyan-500 font-medium">{t("noQuizBtn")}</span>{" "}{t("noQuizSub2")}
            </p>
            <div className="mt-8 w-full max-w-md space-y-3 opacity-[0.15] pointer-events-none select-none">
              {[75, 55, 85].map((w, i) => (
                <div key={i} className="p-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-left">
                  <div className="h-3 bg-gray-300 dark:bg-slate-500 rounded mb-3" style={{ width: `${w}%` }} />
                  <div className="grid grid-cols-2 gap-2">
                    {[1,2,3,4].map((o) => <div key={o} className="h-7 bg-gray-200 dark:bg-slate-600 rounded-lg" />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="p-5 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50 animate-pulse" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-slate-600 rounded-lg" />
                  <div className="h-3 w-20 bg-gray-200 dark:bg-slate-600 rounded" />
                </div>
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-slate-600 rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-slate-600 rounded mb-4" />
                <div className="grid grid-cols-2 gap-2">
                  {[1,2,3,4].map((o) => <div key={o} className="h-9 bg-gray-200 dark:bg-slate-600 rounded-lg" />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Questions + Image */}
        {hasQuestions && !loading && (
          <div className="space-y-5">

            {/* Image section */}
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-slate-600 overflow-hidden">

              {/* Pas encore générée */}
              {!imageUrl && !imageLoading && !retrySeconds && !imageError && (
                <button
                  onClick={generateImage}
                  disabled={!quizTitle}
                  className="w-full h-40 flex flex-col items-center justify-center gap-3 text-gray-400 dark:text-slate-500 hover:text-cyan-500 hover:bg-cyan-50/30 dark:hover:bg-cyan-900/10 transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-700 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/30 flex items-center justify-center transition-all">
                    <PictureOutlined className="text-2xl" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">Générer une image IA</p>
                    <p className="text-xs mt-0.5 opacity-60">Powered by Pollinations AI</p>
                  </div>
                </button>
              )}

              {/* Chargement API */}
              {imageLoading && (
                <div className="w-full h-40 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-slate-700/50">
                  <LoadingOutlined className="text-cyan-500 text-3xl animate-spin" />
                  <p className="text-sm text-gray-500 dark:text-slate-400">Génération en cours...</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">Cela peut prendre 10-20 secondes</p>
                </div>
              )}

              {/* Cold start retry */}
              {retrySeconds && !imageLoading && (
                <div className="w-full h-40 flex flex-col items-center justify-center gap-3 bg-amber-50 dark:bg-amber-900/10">
                  <LoadingOutlined className="text-amber-500 text-2xl animate-spin" />
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Modèle en cours de démarrage...</p>
                  <p className="text-xs text-amber-500/70">Retry automatique dans {retrySeconds}s</p>
                </div>
              )}

              {/* Erreur */}
              {imageError && !imageLoading && !imageUrl && (
                <div className="w-full h-40 flex flex-col items-center justify-center gap-3 bg-red-50 dark:bg-red-900/10">
                  <p className="text-sm text-red-500">❌ {imageError}</p>
                  <button onClick={generateImage} className="text-xs text-cyan-500 underline font-medium">Réessayer</button>
                </div>
              )}

              {/* Image générée */}
              {imageUrl && !imageLoading && (
                <div className="relative w-full h-40 bg-gray-100 dark:bg-slate-700 rounded-2xl overflow-hidden">
                  {/* Spinner pendant que l'image se rend */}
                  {imgRendering && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-slate-700 z-10">
                      <LoadingOutlined className="text-cyan-500 text-2xl animate-spin" />
                    </div>
                  )}
                  <img
                    src={imageUrl}
                    alt="Quiz cover"
                    className="w-full h-full object-cover rounded-2xl"
                    onLoad={() => setImgRendering(false)}
                    onError={() => {
                      setImgRendering(false);
                      setImageUrl(null);
                      setImageError("Impossible d'afficher l'image. Réessayez.");
                    }}
                  />
                  {!imgRendering && (
                    <button
                      onClick={generateImage}
                      className="absolute bottom-2 right-2 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/90 dark:bg-slate-800/90 text-gray-700 dark:text-white shadow-md hover:scale-105 transition-all"
                    >
                      <ReloadOutlined className="text-xs" />
                      Régénérer
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Questions */}
            {questions.map((q, index) => (
              <div key={index} className="p-5 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50 hover:border-cyan-200 dark:hover:border-cyan-700 transition-all duration-200">
                <div className="flex items-start gap-3 mb-4">
                  <span className="w-7 h-7 rounded-lg bg-cyan-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white leading-relaxed">{q.question}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {q.options.map((option, optIndex) => {
                    const isCorrect = option === q.correct_answer;
                    const letters = ["A","B","C","D"];
                    return (
                      <div key={optIndex} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                        isCorrect
                          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400"
                          : "bg-white dark:bg-slate-600 border-gray-200 dark:border-slate-500 text-gray-600 dark:text-slate-300"
                      }`}>
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                          isCorrect ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-slate-500 text-gray-500 dark:text-slate-300"
                        }`}>{letters[optIndex]}</span>
                        {option}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                    <span className="text-amber-500 text-sm flex-shrink-0">💡</span>
                    <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                      <span className="font-semibold">Hint : </span>{q.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}