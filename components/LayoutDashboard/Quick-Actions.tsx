"use client";
import React from "react";
import {
  CaretRightOutlined, TeamOutlined,
  RobotOutlined, EditOutlined,
} from "@ant-design/icons";
import { Card } from "antd";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

const QuickActions = () => {
  const t = useTranslations("quickActions");
  const router = useRouter();

  const actions = [
    {
      icon: <CaretRightOutlined className="text-sm" />,
      label: t("startQuiz"),
      sub: t("startQuizSub"),
      href: "/browse",
      from: "from-cyan-400",
      to: "to-cyan-500",
    },
    {
      icon: <TeamOutlined className="text-sm" />,
      label: t("playFriends"),
      sub: t("playFriendsSub"),
      href: "/multiplayer",
      from: "from-cyan-500",
      to: "to-teal-500",
    },
    {
      icon: <EditOutlined className="text-sm" />,
      label: t("createQuiz"),
      sub: t("createQuizSub"),
      href: "/create-quiz",
      from: "from-teal-400",
      to: "to-cyan-500",
    },
    {
      icon: <RobotOutlined className="text-sm" />,
      label: t("generateAI"),
      sub: t("generateAISub"),
      href: "/generate",
      from: "from-teal-500",
      to: "to-cyan-600",
    },
  ];

  return (
    <Card
      className="!rounded-2xl !border !border-cyan-100 !shadow-sm !bg-white dark:!bg-slate-800 dark:!border-slate-700"
      bodyStyle={{ padding: "16px" }}
    >
      <h2 className="text-sm font-bold text-gray-800 dark:text-white mb-3">
        {t("title")}
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {actions.map((a, i) => (
          <button
            key={i}
            onClick={() => router.push(a.href)}
            className={`group p-3 rounded-xl bg-gradient-to-br ${a.from} ${a.to} text-white hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 flex flex-col items-start gap-1`}
          >
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              {a.icon}
            </div>
            <p className="font-bold text-xs leading-tight mt-1">{a.label}</p>
            <p className="text-white/75 text-[10px] leading-tight">{a.sub}</p>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;