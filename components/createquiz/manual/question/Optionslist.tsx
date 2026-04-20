"use client";

import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Option, OPTION_LETTERS, QuestionType } from "@/types/quiz";

interface OptionsListProps {
  options: Option[];
  correctOptionId: string | null;
  questionType: QuestionType;
  onSelectCorrect: (optionId: string) => void;
  onUpdateOption: (optionId: string, text: string) => void;
  onDeleteOption: (optionId: string) => void;
  onAddOption: () => void;
}

export default function OptionsList({
  options,
  correctOptionId,
  questionType,
  onSelectCorrect,
  onUpdateOption,
  onDeleteOption,
  onAddOption,
}: OptionsListProps) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-3">
        Answers —{" "}
        <span className="normal-case font-normal">click the circle to mark correct</span>
      </label>

      <div className="space-y-2">
        {options.map((opt, optIdx) => {
          const isCorrect = correctOptionId === opt.id;
          return (
            <div
              key={opt.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 ${
                isCorrect
                  ? "border-cyan-400 dark:border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 shadow-sm"
                  : "border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:border-gray-200 dark:hover:border-slate-600"
              }`}
            >
              <span
                className={`text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                  isCorrect
                    ? "bg-cyan-500 text-white"
                    : "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500"
                }`}
              >
                {OPTION_LETTERS[optIdx]}
              </span>

              <button
                onClick={() => onSelectCorrect(opt.id)}
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isCorrect
                    ? "border-cyan-500 bg-cyan-500"
                    : "border-gray-300 dark:border-slate-600 hover:border-cyan-400"
                }`}
              >
                {isCorrect && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </button>

              <input
                type="text"
                value={opt.text}
                onChange={(e) => onUpdateOption(opt.id, e.target.value)}
                placeholder={`Option ${OPTION_LETTERS[optIdx]}...`}
                className="flex-1 text-sm bg-transparent outline-none text-gray-700 dark:text-slate-300 placeholder-gray-300 dark:placeholder-slate-600"
              />

              {questionType !== "truefalse" && (
                <button
                  onClick={() => onDeleteOption(opt.id)}
                  className="text-gray-200 dark:text-slate-700 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <DeleteOutlined className="text-xs" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {questionType === "multiple" && options.length < 6 && (
        <button
          onClick={onAddOption}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-slate-500 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors px-2 py-1 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/10"
        >
          <PlusOutlined />
          Add option
        </button>
      )}
    </div>
  );
}