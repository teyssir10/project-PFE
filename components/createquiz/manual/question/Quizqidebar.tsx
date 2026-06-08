"use client";

interface Question {
  id: string;
  text: string;
  type: string;
}

interface QuizSidebarProps {
  questions: Question[];
  activeId: string;
  quizTitle: string;
  saving: boolean;
  isOpen?: boolean;
  onSelectQuestion: (id: string) => void;
  onAddQuestion: () => void;
  onSave: () => void;
  onTitleChange: (title: string) => void;
  onClose?: () => void;
}

export default function QuizSidebar({
  questions,
  activeId,
  quizTitle,
  saving,
  isOpen = false,
  onSelectQuestion,
  onAddQuestion,
  onSave,
  onTitleChange,
  onClose,
}: QuizSidebarProps) {
  return (
   <aside
  className={`
    fixed md:sticky md:top-0 md:self-start
    top-0 left-0 z-40
    w-72 shrink-0
    bg-white dark:bg-slate-900
    border-r border-gray-100 dark:border-slate-800
    flex flex-col
    h-screen
    transition-transform duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
  `}
>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
        {/* ✕ mobile uniquement */}
        <button
          onClick={onClose}
          className="md:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Titre du quiz */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 shrink-0">
        <input
          value={quizTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Titre du quiz"
          className="w-full text-base font-bold bg-transparent border-b border-gray-200 dark:border-slate-700 outline-none text-gray-900 dark:text-white pb-1 placeholder:text-gray-300"
        />
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">
          {questions.length} question{questions.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Liste des questions — scrollable */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => onSelectQuestion(q.id)}
            className={`w-full text-left rounded-xl px-3 py-3 flex items-center gap-3 transition-all ${
              activeId === q.id
                ? "bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800"
                : "hover:bg-gray-50 dark:hover:bg-slate-800 border border-transparent"
            }`}
          >
            <span className="w-7 h-7 rounded-lg bg-cyan-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                {q.text.trim() || "Question sans titre"}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wide mt-0.5">
                {q.type}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Bouton Ajouter — épinglé en bas, jamais scrollé */}
      <div className=" mb-18 p-3 border-t border-gray-100 dark:border-slate-800 shrink-0 ">
        <button
          onClick={onAddQuestion}
          className="w-full flex items-center justify-center gap-2 py-2.5 p-10 rounded-xl border-2 border-dashed border-cyan-300 dark:border-cyan-700 text-cyan-500 dark:text-cyan-400 text-sm font-semibold hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter une question
        </button>
      </div>
    </aside>
  );
}