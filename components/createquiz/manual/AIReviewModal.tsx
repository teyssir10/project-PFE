"use client";

import React from "react";
import { Modal } from "antd";
import {
  CheckCircleOutlined, WarningOutlined,
  CloseCircleOutlined, RobotOutlined,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";

interface AIReviewResult {
  score: number;
  decision: "approve" | "needs_review" | "reject";
  remarks: string[];
}

interface AIReviewModalProps {
  open: boolean;
  result: AIReviewResult | null;
  loading: boolean;
  onFix: () => void;
  onForcePublish: () => void;
  onClose: () => void;    
  onApprove: () => void;  
}

const scoreConfig = {
  approve: {
    icon: <CheckCircleOutlined className="text-3xl text-emerald-500" />,
    titleKey: "approve.title",
    titleColor: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800/40",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  needs_review: {
    icon: <WarningOutlined className="text-3xl text-amber-500" />,
    titleKey: "needs_review.title",
    titleColor: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800/40",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  reject: {
    icon: <CloseCircleOutlined className="text-3xl text-rose-500" />,
    titleKey: "reject.title",
    titleColor: "text-rose-700 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-900/20",
    border: "border-rose-200 dark:border-rose-800/40",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  },
};

export default function AIReviewModal({
  open, result, loading, onFix, onForcePublish, onClose, onApprove,
}: AIReviewModalProps) {
  const t = useTranslations("aiReview");
  const config = result ? scoreConfig[result.decision] : null;

  return (
    <Modal
      open={open}
      onCancel={onClose}        
      footer={null}
      centered
      width={480}
      closable={!loading}
      mask={{ closable: !loading }}
    >
     
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-14 h-14 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center">
            <RobotOutlined className="text-2xl text-cyan-500 animate-pulse" />
          </div>
          <p className="font-bold text-gray-800 dark:text-white text-base">
            {t("loading.title")}
          </p>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            {t("loading.subtitle")}
          </p>
          <div className="flex gap-1 mt-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* Result state */}
      {!loading && result && config && (
        <div className="space-y-5 pt-2">
          {/* Header */}
          <div className={`flex items-center gap-4 p-4 rounded-2xl border ${config.bg} ${config.border}`}>
            {config.icon}
            <div className="flex-1">
              <p className={`font-extrabold text-base ${config.titleColor}`}>
                {t(config.titleKey as any)}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                {t("scoreLabel")}
              </p>
            </div>
            <div className={`text-2xl font-extrabold px-3 py-1 rounded-xl ${config.badge}`}>
              {result.score}/100
            </div>
          </div>

          {/* Remarks */}
          {result.remarks.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                {t("remarksLabel")}
              </p>
              <div className="space-y-2">
                {result.remarks.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                    <span className="text-gray-400 text-sm mt-0.5 flex-shrink-0">•</span>
                    <p className="text-sm text-gray-700 dark:text-slate-300">{r}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-1">
            {result.decision === "approve" ? (
              <button
                onClick={onApprove}
                className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-400 transition-all"
              >
                ✅ {t("actions.publish")}
              </button>
            ) : (
              <>
                {/* Corriger = fermer le modal, rester sur la page */}
                <button
                  onClick={onFix}
                  className="w-full py-3 rounded-xl bg-cyan-500 text-white font-bold text-sm hover:bg-cyan-400 transition-all"
                >
                  ✏️ {t("actions.fix")}
                </button>
                {/* Envoyer à l'admin quand même */}
                <button
                  onClick={onForcePublish}
                  className="w-full py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                >
                  {t("actions.forcePublish")}
                </button>
              </>
            )}
          </div>

          {result.decision !== "approve" && (
            <p className="text-[11px] text-center text-gray-400 dark:text-slate-500">
              {t("forcePublishNote")}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}