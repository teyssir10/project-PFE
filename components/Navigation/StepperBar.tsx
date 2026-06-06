"use client";

import React, { useState, useRef, useEffect } from "react";
import { RocketOutlined, SaveOutlined, CheckOutlined, LoadingOutlined } from "@ant-design/icons";
import { Step } from "@/types/stepperBar";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { message } from "antd";
import AIReviewModal from "@/components/createquiz/manual/AIReviewModal";

interface DraftData {
  draftId?:         string;
  title?:           string;
  description?:     string;
  difficulty?:      string;
  questions?:       any[];
  timePerQuestion?: number;
  coverImage?:      string | null;
  source?:          "manual" | "ai";
}

export interface PublishResult {
  status:    "published" | "pending_admin";
  aiScore:   number | null;
  aiRemarks: string[] | null;
}

interface StepperBarProps {
  currentStep:   number;
  withSidebar?:  boolean;
  steps?:        Step[];
  onPublish?:    (result?: PublishResult) => void;
  draftData?:    DraftData;
  onDraftSaved?: (draftId: string) => void;
  skipAIReview?: boolean;
}

const capitalizeDifficulty = (s: string): string =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "Medium";

export default function StepperBar({
  currentStep, withSidebar = false, steps, onPublish, draftData, onDraftSaved, skipAIReview = false,
}: StepperBarProps) {
  const t = useTranslations("stepper");
  const { user } = useAuth();
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftSaved,  setDraftSaved]  = useState(false);
  const [reviewOpen,    setReviewOpen]    = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewResult,  setReviewResult]  = useState<any>(null);

  const draftDataRef = useRef<DraftData | undefined>(draftData);
  useEffect(() => { draftDataRef.current = draftData; }, [draftData]);

  const savedDraftId = useRef<string | undefined>(draftData?.draftId);
  useEffect(() => {
    if (draftData?.draftId) savedDraftId.current = draftData.draftId;
  }, [draftData?.draftId]);

  const AI_STEPS: Step[] = [
    { id: 1, label: t("aiStep1") },
    { id: 2, label: t("aiStep2") },
    { id: 3, label: t("aiStep3") },
  ];
  const resolvedSteps = steps ?? AI_STEPS;

  const saveDraft = async () => {
    if (!user) { message.error("You must be logged in."); return; }
    setSavingDraft(true);
    const current = draftDataRef.current;
    try {
      const payload = {
        user_id:           user.id,
        title:             current?.title           || "Untitled Quiz",
        description:       current?.description     || "",
        difficulty:        capitalizeDifficulty(current?.difficulty || "Medium"),
        questions:         current?.questions       || [],
        time_per_question: current?.timePerQuestion ?? 20,
        cover_image:       current?.coverImage      ?? null,
        source:            current?.source          ?? "manual",
        current_step:      currentStep,
        saved_at:          new Date().toISOString(),
      };
      let draftId = savedDraftId.current;
      if (draftId) {
        const { error } = await supabase.from("quiz_drafts").update(payload).eq("id", draftId).eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("quiz_drafts").insert(payload).select("id").single();
        if (error) throw error;
        draftId = (data as { id: string }).id;
        savedDraftId.current = draftId;
        onDraftSaved?.(draftId);
      }
      setDraftSaved(true);
      message.success("Draft saved!");
      setTimeout(() => setDraftSaved(false), 3000);
    } catch (err) {
      console.error("Save draft error:", err);
      message.error("Failed to save draft.");
    } finally {
      setSavingDraft(false);
    }
  };

  const handleReviewAndPublish = async () => {
    if (currentStep < 2) return;
    if (skipAIReview) { onPublish?.({ status: "published", aiScore: null, aiRemarks: null }); return; }
    const current = draftDataRef.current;
    setReviewOpen(true); setReviewLoading(true); setReviewResult(null);
    try {
      const res = await fetch("/api/review-quiz", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: current?.title, difficulty: current?.difficulty, questions: current?.questions }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setReviewResult(json.data);
    } catch (err: any) {
      message.error("AI review failed: " + err.message);
      setReviewOpen(false);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleApproveAndPublish = () => {
    setReviewOpen(false);
    onPublish?.({ status: "published", aiScore: reviewResult?.score ?? null, aiRemarks: reviewResult?.remarks ?? null });
  };

  const handleForcePublish = () => {
    setReviewOpen(false);
    onPublish?.({ status: "pending_admin", aiScore: reviewResult?.score ?? null, aiRemarks: reviewResult?.remarks ?? null });
    message.info("Quiz envoyé à l'admin.");
  };

  return (
    <>
      <div className={`fixed bottom-0 right-0 ${withSidebar ? "md:left-64 left-0" : "left-0"}
        bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700
        shadow-[0_-1px_8px_rgba(0,0,0,0.04)] z-50`}>
        <div className="h-14 px-3 md:px-6 flex items-center justify-between gap-2">

          {/* Steps — scrollable on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden min-w-0" style={{ scrollbarWidth: "none" }}>
            {resolvedSteps.map((s, idx) => {
              const isDone   = currentStep > s.id;
              const isActive = currentStep === s.id;
              return (
                <div key={s.id} className="flex items-center gap-1.5 shrink-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 transition-all ${
                    isDone ? "bg-cyan-400" : isActive ? "bg-cyan-500 ring-2 ring-cyan-200 dark:ring-cyan-800" : "bg-gray-300 dark:bg-slate-600"
                  }`} />
                  {/* Full label on md+, short on mobile */}
                  <span className={`text-xs font-medium whitespace-nowrap ${
                    isActive ? "text-gray-800 dark:text-white" : isDone ? "text-cyan-500" : "text-gray-400 dark:text-slate-500"
                  }`}>
                    <span className="hidden sm:inline">{t("stepOf", { current: s.id, total: resolvedSteps.length })} — {s.label}</span>
                    <span className="sm:hidden">{s.id}/{resolvedSteps.length}</span>
                  </span>
                  {idx < resolvedSteps.length - 1 && (
                    <span className="text-gray-200 dark:text-slate-700 text-xs hidden sm:inline">|</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            <button type="button" onClick={saveDraft} disabled={savingDraft}
              className={`flex items-center gap-1 text-xs font-medium px-2 md:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                draftSaved ? "text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20" : "text-gray-400 hover:text-cyan-500 hover:bg-gray-50 dark:hover:bg-slate-800"
              } disabled:opacity-50`}>
              {savingDraft ? <LoadingOutlined /> : draftSaved ? <CheckOutlined /> : <SaveOutlined />}
              <span className="hidden sm:inline">{savingDraft ? "Saving…" : draftSaved ? "Saved!" : t("saveDraft")}</span>
            </button>
            <button type="button" disabled={currentStep < 2} onClick={handleReviewAndPublish}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 md:px-4 py-2 rounded-full
                bg-gray-900 dark:bg-white text-white dark:text-gray-900
                hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed
                transition-all shadow-md whitespace-nowrap">
              <span className="hidden sm:inline">{t("reviewPublish")}</span>
              <span className="sm:hidden">Publish</span>
              <RocketOutlined />
            </button>
          </div>
        </div>
      </div>

      <AIReviewModal
        open={reviewOpen} result={reviewResult} loading={reviewLoading}
        onFix={() => setReviewOpen(false)} onForcePublish={handleForcePublish}
        onClose={() => setReviewOpen(false)} onApprove={handleApproveAndPublish}
      />
    </>
  );
}