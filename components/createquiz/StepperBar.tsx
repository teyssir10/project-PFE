"use client";

import React from 'react';
import { RocketOutlined } from "@ant-design/icons";
import {Step} from '@/types/stepperBar';
const steps: Step[] = [
  { id: 1, label: "Configure quiz" },
  { id: 2, label: "Generating questions" },
  { id: 3, label: "Review & publish" },
];

interface StepperBarProps {
  currentStep: number;
}

export default function StepperBar({ currentStep }: StepperBarProps) {
  return (
    <div className="sticky bottom-0 w-full bg-white border-t border-gray-100 shadow-[0_-1px_8px_rgba(0,0,0,0.04)] z-20">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-6">

        {/* Steps */}
        <div className="flex items-center gap-4">
          {steps.map((s, idx) => {
            const isDone = currentStep > s.id;
            const isActive = currentStep === s.id;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full transition-all ${
                  isDone ? "bg-cyan-400" : isActive ? "bg-cyan-500 ring-2 ring-cyan-200" : "bg-gray-300"
                }`} />
                <span className={`text-xs font-medium transition-all ${
                  isActive ? "text-gray-800" : isDone ? "text-cyan-500" : "text-gray-400"
                }`}>
                  Step {s.id} of {steps.length} — {s.label}
                </span>
                {idx < steps.length - 1 && (
                  <span className="ml-2 text-gray-200 text-xs">|</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
  type="button"
  className="
    text-xs text-gray-400
    hover:text-[#00D4D0]   /* ← couleur au hover */
    font-medium px-3 py-1.5
    rounded-lg
    hover:bg-gray-50
    transition-all
  "
>
  Save draft
</button>
          <button
  type="button"
  disabled={currentStep < 3}
  className="
    inline-flex items-center gap-2
    text-sm font-semibold
    px-6 py-3
    rounded-full
    bg-gray-900 text-white
    hover:bg-gray-700
    disabled:opacity-40 disabled:cursor-not-allowed
    transition-all duration-300
    shadow-md hover:shadow-lg
  "
>
  Review & Publish
  <RocketOutlined className="text-base" />
</button>
        </div>

      </div>
    </div>
  );
}