"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Spin, Switch, message } from "antd";
import {
  UserOutlined, LockOutlined, GlobalOutlined, BulbOutlined,
  CameraOutlined, CheckOutlined, LogoutOutlined, FileTextOutlined,
  EditOutlined, DeleteOutlined, PlayCircleOutlined, AppstoreOutlined,
} from "@ant-design/icons";
import { useQuizModeStore } from "@/store/useQuizModeStore";

type Section = "profile" | "security" | "language" | "appearance" | "drafts" | "myquizzes";

interface QuizDraft {
  id: string; title: string; description: string;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  current_step: number; saved_at: string;
}

interface MyQuiz {
  id: string; title: string; difficulty: string; question_count: number;
  status: string; ai_score: number | null; ai_remarks: string[] | null;
  admin_note: string | null; created_at: string;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  easy:   "bg-green-50  text-green-700  dark:bg-green-900/20  dark:text-green-400",
  medium: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  hard:   "bg-red-50    text-red-700    dark:bg-red-900/20    dark:text-red-400",
  mixed:  "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  published:     { label: "Publié",     icon: "✅", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  pending_admin: { label: "En attente", icon: "⏳", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"         },
  rejected:      { label: "Rejeté",    icon: "❌", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"                 },
  draft:         { label: "Brouillon", icon: "📝", color: "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400"              },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000); const hours = Math.floor(diff / 3600000); const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`; if (hours < 24) return `${hours}h ago`; return `${days}d ago`;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const t = useTranslations("settings");
  const locale = useLocale();
  const router = useRouter();
  const { setMode } = useQuizModeStore();

  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [saved, setSaved] = useState(false);
  const [firstName, setFirstName] = useState(user?.user_metadata?.firstname || "");
  const [lastName,  setLastName]  = useState(user?.user_metadata?.lastname  || "");
  const [bio,       setBio]       = useState(user?.user_metadata?.bio       || "");
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [drafts, setDrafts] = useState<QuizDraft[]>([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [myQuizzes, setMyQuizzes] = useState<MyQuiz[]>([]);
  const [myQuizzesLoading, setMyQuizzesLoading] = useState(false);
  const [quizFilter, setQuizFilter] = useState<"all" | "published" | "pending_admin" | "rejected">("all");

  useEffect(() => { setDarkMode(document.documentElement.classList.contains("dark")); }, []);
  useEffect(() => { if (activeSection === "drafts" && user) fetchDrafts(); }, [activeSection, user]);
  useEffect(() => { if (activeSection === "myquizzes" && user) fetchMyQuizzes(); }, [activeSection, user]);

  const fetchDrafts = async () => {
    setDraftsLoading(true);
    const { data, error } = await supabase
      .from("quiz_drafts")
      .select("id, title, description, difficulty, current_step, saved_at")
      .eq("user_id", user!.id)
      .order("saved_at", { ascending: false });
    setDraftsLoading(false);
    if (!error && data) setDrafts(data as QuizDraft[]);
  };

  const fetchMyQuizzes = async () => {
    setMyQuizzesLoading(true);
    const { data, error } = await supabase
      .from("quizzes")
      .select("id, title, difficulty, question_count, status, ai_score, ai_remarks, admin_note, created_at")
      .eq("creator_id", user!.id)
      .order("created_at", { ascending: false });
    setMyQuizzesLoading(false);
    if (!error && data) setMyQuizzes(data as MyQuiz[]);
  };

  const deleteDraft = async (id: string) => {
    const { error } = await supabase.from("quiz_drafts").delete().eq("id", id);
    if (!error) { setDrafts(p => p.filter(d => d.id !== id)); message.success("Draft deleted."); }
    else message.error("Failed.");
  };

  // ── Resume draft → force mode manual ──────────────────────────────────────
  const resumeDraft = (d: QuizDraft) => {
    setMode("manual");
    router.push(`/${locale}/create-quiz?draft=${d.id}`);
  };

  const toggleDark = (c: boolean) => {
    setDarkMode(c);
    document.documentElement.classList.toggle("dark", c);
    localStorage.setItem("theme", c ? "dark" : "light");
  };

  const saveProfile = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ data: { firstname: firstName, lastname: lastName, bio } });
    setLoading(false);
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    else message.error(t("saveError"));
  };

  const savePassword = async () => {
    if (newPwd !== confirmPwd) { message.error(t("pwdMismatch")); return; }
    if (newPwd.length < 6) { message.error(t("pwdTooShort")); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setLoading(false);
    if (!error) { message.success(t("pwdChanged")); setCurrentPwd(""); setNewPwd(""); setConfirmPwd(""); }
    else message.error(t("saveError"));
  };

  const pendingCount = myQuizzes.filter(q => q.status === "pending_admin").length;
  const filteredQuizzes = quizFilter === "all" ? myQuizzes : myQuizzes.filter(q => q.status === quizFilter);

  const sections: { key: Section; icon: React.ReactNode; label: string; badge?: number }[] = [
    { key: "profile",    icon: <UserOutlined />,     label: t("nav.profile")    },
    { key: "security",   icon: <LockOutlined />,     label: t("nav.security")   },
    { key: "language",   icon: <GlobalOutlined />,   label: t("nav.language")   },
    { key: "appearance", icon: <BulbOutlined />,     label: t("nav.appearance") },
    { key: "drafts",     icon: <FileTextOutlined />, label: t("nav.drafts")     },
    { key: "myquizzes",  icon: <AppstoreOutlined />, label: "Mes Quiz", badge: pendingCount },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-6 px-2 lg:px-10">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-gray-800 dark:text-white">{t("title")}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{t("subtitle")}</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Sidebar */}
        <div className="w-full lg:w-56 flex-shrink-0">
          <div className="bg-white dark:bg-slate-800 border border-cyan-100 dark:border-slate-700 rounded-2xl p-2 space-y-1">
            {sections.map((s) => (
              <button key={s.key} onClick={() => setActiveSection(s.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeSection === s.key ? "bg-cyan-500 text-white shadow-sm" : "text-gray-600 dark:text-gray-400 hover:bg-cyan-50 dark:hover:bg-slate-700"}`}>
                <span className="text-base">{s.icon}</span>
                <span className="flex-1 text-left">{s.label}</span>
                {s.badge !== undefined && s.badge > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${activeSection === s.key ? "bg-white/20 text-white" : "bg-amber-500 text-white"}`}>{s.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-slate-800 border border-cyan-100 dark:border-slate-700 rounded-2xl p-6">

            {/* PROFILE */}
            {activeSection === "profile" && (
              <div className="space-y-5">
                <h2 className="text-base font-extrabold text-gray-800 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-3">{t("nav.profile")}</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-400 flex items-center justify-center text-white text-2xl font-extrabold shadow-md">
                      {firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center shadow-sm hover:bg-cyan-600 transition-all">
                      <CameraOutlined className="text-white text-[10px]" />
                    </button>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-white text-sm">{firstName} {lastName}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[{ label: t("profile.firstName"), val: firstName, set: setFirstName }, { label: t("profile.lastName"), val: lastName, set: setLastName }].map((f, i) => (
                    <div key={i}>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">{f.label}</label>
                      <input value={f.val} onChange={e => f.set(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">{t("profile.email")}</label>
                  <input value={user?.email || ""} disabled className="w-full px-3 py-2.5 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50 text-sm text-gray-400 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">{t("profile.bio")}</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all resize-none" />
                </div>
                <button onClick={saveProfile} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-white text-sm font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-60">
                  {loading ? <Spin size="small" /> : saved ? <CheckOutlined /> : null}{saved ? t("saved") : t("save")}
                </button>
              </div>
            )}

            {/* SECURITY */}
            {activeSection === "security" && (
              <div className="space-y-5">
                <h2 className="text-base font-extrabold text-gray-800 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-3">{t("nav.security")}</h2>
                {[
                  { label: t("security.currentPwd"), value: currentPwd, setter: setCurrentPwd },
                  { label: t("security.newPwd"),     value: newPwd,     setter: setNewPwd     },
                  { label: t("security.confirmPwd"), value: confirmPwd, setter: setConfirmPwd },
                ].map((f, i) => (
                  <div key={i}>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">{f.label}</label>
                    <input type="password" value={f.value} onChange={e => f.setter(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" />
                  </div>
                ))}
                <button onClick={savePassword} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-white text-sm font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-60">
                  {loading && <Spin size="small" />}{t("security.changeBtn")}
                </button>
                <div className="mt-6 pt-5 border-t border-gray-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-red-400 mb-3">{t("security.dangerZone")}</p>
                  <button onClick={() => supabase.auth.signOut().then(() => router.push("/"))} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 transition-all">
                    <LogoutOutlined />{t("security.logout")}
                  </button>
                </div>
              </div>
            )}

            {/* LANGUAGE */}
            {activeSection === "language" && (
              <div className="space-y-4">
                <h2 className="text-base font-extrabold text-gray-800 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-3">{t("nav.language")}</h2>
                {[{ code: "fr", label: "Français", flag: "🇫🇷" }, { code: "en", label: "English", flag: "🇬🇧" }, { code: "ar", label: "العربية", flag: "🇹🇳" }].map((lang) => (
                  <button key={lang.code} onClick={() => router.push(`/${lang.code}/settings`)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${locale === lang.code ? "border-cyan-400 bg-cyan-50 dark:bg-cyan-900/20" : "border-gray-200 dark:border-slate-600 hover:border-cyan-200"}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-bold text-sm text-gray-800 dark:text-white">{lang.label}</span>
                    </div>
                    {locale === lang.code && <CheckOutlined className="text-cyan-500" />}
                  </button>
                ))}
              </div>
            )}

            {/* APPEARANCE */}
            {activeSection === "appearance" && (
              <div className="space-y-4">
                <h2 className="text-base font-extrabold text-gray-800 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-3">{t("nav.appearance")}</h2>
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg">{darkMode ? "🌙" : "☀️"}</div>
                    <div>
                      <p className="font-bold text-sm text-gray-800 dark:text-white">{darkMode ? t("appearance.dark") : t("appearance.light")}</p>
                      <p className="text-xs text-gray-400">{t("appearance.themeSub")}</p>
                    </div>
                  </div>
                  <Switch checked={darkMode} onChange={toggleDark} className={darkMode ? "!bg-cyan-500" : ""} />
                </div>
              </div>
            )}

            {/* DRAFTS */}
            {activeSection === "drafts" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-3">
                  <h2 className="text-base font-extrabold text-gray-800 dark:text-white">{t("nav.drafts")}</h2>
                  {!draftsLoading && <span className="text-xs text-gray-400 font-medium">{drafts.length} draft{drafts.length !== 1 ? "s" : ""} saved</span>}
                </div>
                {draftsLoading ? (
                  <div className="flex justify-center py-10"><Spin /></div>
                ) : drafts.length === 0 ? (
                  <div className="flex flex-col items-center py-14 gap-3 text-center">
                    <FileTextOutlined className="text-3xl text-gray-300" />
                    <p className="text-sm text-gray-400">No saved drafts yet</p>
                    <button onClick={() => router.push(`/${locale}/create-quiz`)} className="px-4 py-2 rounded-xl bg-cyan-500 text-white text-xs font-bold hover:bg-cyan-600 transition-all">Create a quiz</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {drafts.map((draft) => (
                      <div key={draft.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/40 hover:border-cyan-200 transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center flex-shrink-0">
                            <EditOutlined className="text-cyan-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{draft.title || "Untitled Quiz"}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${DIFFICULTY_STYLES[draft.difficulty] ?? DIFFICULTY_STYLES.easy}`}>{draft.difficulty}</span>
                              <span className="text-[11px] text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-2 py-0.5 rounded-full font-medium">Step {draft.current_step} of 3</span>
                              <span className="text-[11px] text-gray-400">{timeAgo(draft.saved_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => deleteDraft(draft.id)} className="w-8 h-8 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all">
                            <DeleteOutlined className="text-sm" />
                          </button>
                          <button onClick={() => resumeDraft(draft)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-white text-xs font-bold hover:bg-cyan-600 transition-all">
                            <PlayCircleOutlined /> Resume
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MES QUIZ */}
            {activeSection === "myquizzes" && (
              <div className="space-y-5">
                <div className="border-b border-gray-100 dark:border-slate-700 pb-3">
                  <h2 className="text-base font-extrabold text-gray-800 dark:text-white">Mes Quiz</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Suivez le statut de vos quiz soumis à la modération</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {(["all", "pending_admin", "published", "rejected"] as const).map((f) => {
                    const count = f === "all" ? myQuizzes.length : myQuizzes.filter(q => q.status === f).length;
                    const cfg = f === "all" ? null : STATUS_CONFIG[f];
                    return (
                      <button key={f} onClick={() => setQuizFilter(f)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${quizFilter === f ? "bg-cyan-500 text-white shadow-sm" : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"}`}>
                        {cfg ? `${cfg.icon} ${cfg.label}` : "Tous"}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${quizFilter === f ? "bg-white/20" : "bg-gray-200 dark:bg-slate-600"}`}>{count}</span>
                      </button>
                    );
                  })}
                </div>

                {myQuizzesLoading ? (
                  <div className="flex justify-center py-10"><Spin /></div>
                ) : filteredQuizzes.length === 0 ? (
                  <div className="flex flex-col items-center py-14 gap-3 text-center">
                    <span className="text-4xl">📝</span>
                    <p className="text-sm text-gray-400">Aucun quiz trouvé</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredQuizzes.map((quiz) => {
                      const cfg = STATUS_CONFIG[quiz.status] ?? STATUS_CONFIG.draft;
                      return (
                        <div key={quiz.id} className="bg-gray-50 dark:bg-slate-700/40 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 transition-all hover:border-cyan-200 dark:hover:border-cyan-800">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <p className="text-sm font-bold text-gray-800 dark:text-white flex-1 truncate">{quiz.title}</p>
                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${cfg.color}`}>{cfg.icon} {cfg.label}</span>
                            {quiz.ai_score !== null && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-slate-300 font-semibold">Score IA : {quiz.ai_score}/100</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-slate-500 mb-2">
                            <span>{quiz.difficulty}</span><span>•</span><span>{quiz.question_count} questions</span><span>•</span><span>{timeAgo(quiz.created_at)}</span>
                          </div>
                          {quiz.ai_remarks && quiz.ai_remarks.length > 0 && quiz.status !== "published" && (
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/40 mb-2">
                              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-1.5">🤖 Remarques de l'IA :</p>
                              <ul className="space-y-1">
                                {quiz.ai_remarks.map((r, i) => (
                                  <li key={i} className="text-[11px] text-amber-600 dark:text-amber-300 flex items-start gap-1.5"><span className="flex-shrink-0 mt-0.5">•</span>{r}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {quiz.status === "pending_admin" && (
                            <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-100 dark:border-cyan-800/40">
                              <p className="text-[11px] text-cyan-600 dark:text-cyan-400">⏳ En cours de révision par l'administrateur. Vous serez notifié de la décision.</p>
                            </div>
                          )}
                          {quiz.status === "rejected" && quiz.admin_note && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/40">
                              <p className="text-[11px] font-bold text-red-600 dark:text-red-400 mb-1">❌ Décision de l'admin :</p>
                              <p className="text-[11px] text-red-500 dark:text-red-300">{quiz.admin_note}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}