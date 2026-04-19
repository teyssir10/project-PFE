"use client";

import React from "react";
import { RocketOutlined } from "@ant-design/icons";
import { Step } from "@/types/stepperBar";

export const AI_STEPS: Step[] = [
  { id: 1, label: "Configure quiz" },
  { id: 2, label: "Generating" },
  { id: 3, label: "Review & publish" },
];

export const MANUAL_STEPS: Step[] = [
  { id: 1, label: "Quiz info" },
  { id: 2, label: "Create questions" },
  { id: 3, label: "Review & publish" },
];

interface StepperBarProps {
  currentStep: number;
  withSidebar?: boolean;
  steps?: Step[];
  onPublish?: () => void;
}

export default function StepperBar({
  currentStep,
  withSidebar = false,
  steps = AI_STEPS,
  onPublish,
}: StepperBarProps) {
  return (
    <div className={`fixed bottom-0 right-0 ${
      withSidebar ? "left-64" : "left-0"
    } bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700 shadow-[0_-1px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_-1px_8px_rgba(0,0,0,0.3)] z-50 transition-colors duration-300`}>
      <div className="h-14 px-6 flex items-center justify-between gap-4">

        {/* Steps */}
        <div className="flex items-center gap-3">
          {steps.map((s, idx) => {
            const isDone = currentStep > s.id;
            const isActive = currentStep === s.id;
            return (
              <div key={s.id} className="flex items-center gap-2 shrink-0">
                <span className={`w-2 h-2 rounded-full shrink-0 transition-all ${
                  isDone ? "bg-cyan-400"
                  : isActive ? "bg-cyan-500 ring-2 ring-cyan-200 dark:ring-cyan-800"
                  : "bg-gray-300 dark:bg-slate-600"
                }`} />
                <span className={`text-xs font-medium whitespace-nowrap transition-all ${
                  isActive ? "text-gray-800 dark:text-white"
                  : isDone ? "text-cyan-500"
                  : "text-gray-400 dark:text-slate-500"
                }`}>
                  Step {s.id} of {steps.length} — {s.label}
                </span>
                {idx < steps.length - 1 && (
                  <span className="ml-1 text-gray-200 dark:text-slate-700 text-xs">|</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="text-xs text-gray-400 dark:text-slate-500 hover:text-cyan-500 dark:hover:text-cyan-400 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-all whitespace-nowrap"
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={currentStep < 2}
            onClick={onPublish}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap"
          >
            Review & Publish
            <RocketOutlined />
          </button>
        </div>
      </div>
    </div>
  );
}