"use client";

import { DeleteOutlined } from "@ant-design/icons";
import { Question, QuestionType } from "@/types/quiz";
import TypeTabs from "@/components/createquiz/manual/question/Typetabs";
import OptionsList from "@/components/createquiz/manual/question/Optionslist";

interface QuestionEditorProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  canDelete: boolean;
  onTypeChange: (type: QuestionType) => void;
  onTextChange: (text: string) => void;
  onExplanationChange: (text: string) => void;
  onSelectCorrect: (optionId: string) => void;
  onUpdateOption: (optionId: string, text: string) => void;
  onDeleteOption: (optionId: string) => void;
  onAddOption: () => void;
  onDelete: () => void;
}

export default function QuestionEditor({
  question,
  questionIndex,
  totalQuestions,
  canDelete,
  onTypeChange,
  onTextChange,
  onExplanationChange,
  onSelectCorrect,
  onUpdateOption,
  onDeleteOption,
  onAddOption,
  onDelete,
}: QuestionEditorProps) {
  return (
    <div className="space-y-6">
      {/* Barre de progression */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 dark:text-slate-500 font-medium shrink-0">
          {questionIndex + 1} / {totalQuestions}
        </span>
      </div>

      {/* Carte question */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <TypeTabs activeType={question.type} onChange={onTypeChange} />

        <div className="p-6 space-y-6">
          {/* Texte de la question */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-2">
              Question
            </label>
            <textarea
              rows={3}
              value={question.text}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Type your question here..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-white text-sm placeholder-gray-300 dark:placeholder-slate-600 focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-900 resize-none transition-all"
            />
          </div>

          {/* Options de réponse */}
          {question.type !== "short" && (
            <OptionsList
              options={question.options}
              correctOptionId={question.correctOptionId}
              questionType={question.type}
              onSelectCorrect={onSelectCorrect}
              onUpdateOption={onUpdateOption}
              onDeleteOption={onDeleteOption}
              onAddOption={onAddOption}
            />
          )}

          {/* Short answer placeholder */}
          {question.type === "short" && (
            <div className="p-5 rounded-xl border-2 border-dashed border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-center">
              <p className="text-2xl mb-2">✏️</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                Students will type their own answer
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Explication */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6">
        <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-3">
          Hint{" "}
          <span className="normal-case font-normal text-gray-300 dark:text-slate-600">
            (optional)
          </span>
        </label>
        <textarea
          rows={3}
          value={question.explanation}
          onChange={(e) => onExplanationChange(e.target.value)}
          placeholder="Explain why the correct answer is right..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-white text-sm placeholder-gray-300 dark:placeholder-slate-600 focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 resize-none transition-all"
        />
      </div>

      {/* Supprimer la question */}
      {canDelete && (
        <div className="flex justify-end pb-8">
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-500 transition-colors px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
          >
            <DeleteOutlined />
            Delete this question
          </button>
        </div>
      )}
    </div>
  );
}