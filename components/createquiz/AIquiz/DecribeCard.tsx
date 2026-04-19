"use client";

import { Form, Input } from "antd";
import { SUGGESTIONS } from "@/types/aiquiz";

const { TextArea } = Input;

interface DescribeCardProps {
  title: string;
  prompt: string;
  onTitleChange: (v: string) => void;
  onPromptChange: (v: string) => void;
  onTagClick: (tag: string) => void;
}

export default function DescribeCard({
  title,
  prompt,
  onTitleChange,
  onPromptChange,
  onTagClick,
}: DescribeCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors duration-300">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-50 dark:border-slate-700 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center text-base">
          ✍️
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-white">Describe Your Quiz</p>
          <p className="text-[11px] text-gray-400 dark:text-slate-400">Be specific for better AI results</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <Form layout="vertical">
          <Form.Item className="!mb-4">
            <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-1.5">
              Quiz Title
            </label>
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="e.g. JavaScript ES6 Mastery"
              className="!rounded-xl !border-gray-200 dark:!border-slate-600 !py-2.5 !text-sm !bg-gray-50 dark:!bg-slate-700 dark:!text-white focus:!border-cyan-400 hover:!bg-white dark:hover:!bg-slate-600 transition-colors"
            />
          </Form.Item>

          <Form.Item className="!mb-3">
            <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-1.5">
              AI Prompt
            </label>
            <TextArea
              rows={4}
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="Describe topics, subtopics, style..."
              className="!rounded-xl !border-gray-200 dark:!border-slate-600 !text-sm !bg-gray-50 dark:!bg-slate-700 dark:!text-white focus:!border-cyan-400 hover:!bg-white dark:hover:!bg-slate-600 transition-colors resize-none"
            />
          </Form.Item>

          {/* Tags suggestions */}
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onTagClick(s)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 hover:text-cyan-600 dark:hover:text-cyan-400 border border-transparent hover:border-cyan-200 dark:hover:border-cyan-700 transition-all"
              >
                + {s}
              </button>
            ))}
          </div>
        </Form>
      </div>
    </div>
  );
}