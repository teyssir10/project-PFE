"use client";

import { ArrowLeftOutlined, CheckCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { Question, TYPE_LABELS } from "@/types/quiz";
import { useTranslations } from "next-intl";

interface QuizSidebarProps {
  questions: Question[];
  activeId: string;
  quizTitle: string;
  saving: boolean;
  onSelectQuestion: (id: string) => void;
  onAddQuestion: () => void;
  onSave: () => void;
  onTitleChange: (title: string) => void;
}

export default function QuizSidebar({ questions, activeId, quizTitle, saving, onSelectQuestion, onAddQuestion, onSave, onTitleChange }: QuizSidebarProps) {
  const t = useTranslations("quizSidebar");
  const router = useRouter();

  return (
    <aside className="w-64 h-screen fixed top-0 flex flex-col bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 shadow-sm">
      <div className="px-4 py-20 pb-4 border-b border-gray-100 dark:border-slate-800 space-y-3 shrink-0">
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
          <ArrowLeftOutlined /> {t("back")}
        </button>
        <div>
          <input type="text" value={quizTitle} onChange={(e) => onTitleChange(e.target.value)}
            placeholder={t("titlePlaceholder")}
            className="w-full text-sm font-bold bg-transparent outline-none text-gray-800 dark:text-white placeholder-gray-300 dark:placeholder-slate-600 border-b border-gray-200 dark:border-slate-700 focus:border-cyan-400 dark:focus:border-cyan-500 pb-1 transition-colors" />
          <p className="text-[10px] text-gray-400 dark:text-slate-600 mt-1">
            {questions.length} {questions.length > 1 ? t("questionsPlural") : t("questions")}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none z-10" />
        <div className="h-full overflow-y-auto px-2 space-y-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
          {questions.map((q, idx) => (
            <div key={q.id} onClick={() => onSelectQuestion(q.id)}
              className={`group flex items-start gap-2.5 px-3 py-3 rounded-xl cursor-pointer transition-all duration-150 ${
                activeId === q.id
                  ? "bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800"
                  : "hover:bg-gray-50 dark:hover:bg-slate-800 border border-transparent"
              }`}>
              <span className={`text-[10px] font-bold w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                activeId === q.id ? "bg-cyan-500 text-white" : "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500"
              }`}>
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-snug line-clamp-2 ${
                  activeId === q.id ? "text-cyan-700 dark:text-cyan-300 font-semibold" : "text-gray-600 dark:text-slate-400"
                }`}>
                  {q.text || t("untitled")}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] text-gray-300 dark:text-slate-600 uppercase tracking-wide">
                    {TYPE_LABELS[q.type]}
                  </span>
                  {q.correctOptionId && <CheckCircleOutlined className="text-emerald-400 text-[9px]" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 py-2 border-t border-gray-100 dark:border-slate-800 space-y-2 shrink-0 bg-white dark:bg-slate-900">
        <button onClick={onAddQuestion}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-gray-500 dark:text-slate-400 border border-dashed border-gray-200 dark:border-slate-700 hover:border-cyan-400 hover:text-cyan-500 dark:hover:border-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 transition-all">
          <PlusOutlined />
          {t("addQuestion")}
        </button>
      </div>
    </aside>
  );
}