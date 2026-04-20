"use client";

interface QuizInfoFieldsProps {
  title: string;
  description: string;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
}

const inputCls =
  "w-full p-3 rounded-xl border text-sm transition-all outline-none " +
  "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 " +
  "focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 focus:bg-white " +
  "dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 " +
  "dark:focus:border-cyan-500 dark:focus:bg-slate-900";

export default function QuizInfoFields({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: QuizInfoFieldsProps) {
  return (
    <>
      <div>
        <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-2">
          Quiz Title <span className="text-rose-400">*</span>
        </label>
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter your quiz title here..."
          className={inputCls}
        />
        {!title.trim() && (
          <p className="text-[10px] text-gray-300 dark:text-slate-600 mt-1">Required to continue</p>
        )}
      </div>

      <div>
        <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-2">
          Description{" "}
          <span className="normal-case font-normal text-gray-300 dark:text-slate-600">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="What is this quiz about? Give participants a hint..."
          rows={3}
          className={inputCls + " resize-none"}
        />
      </div>
    </>
  );
}