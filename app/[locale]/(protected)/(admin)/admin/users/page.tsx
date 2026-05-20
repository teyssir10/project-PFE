"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";

interface User {
  id: string;
  firstname: string | null;
  lastname: string | null;
  country: string | null;
  role: string | null;
  created_at: string;
  total_score: number;
  quizzes_played: number;
  accuracy: number;
}

export default function AdminUsersPage() {
  const t = useTranslations("adminUsers");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ firstname: "", lastname: "", email: "", password: "", country: "", role: "user" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("users")
      .select("id, firstname, lastname, country, role, created_at, total_score, quizzes_played, accuracy")
      .order("created_at", { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  };

  const updateRole = async (userId: string, newRole: string) => {
    setUpdating(userId);
    await supabase.from("users").update({ role: newRole }).eq("id", userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setUpdating(null);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm(t("actions.deleteConfirm"))) return;
    await supabase.from("users").delete().eq("id", userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleCreateUser = async () => {
    if (!form.email || !form.password || !form.firstname) {
      setCreateError(t("modal.validationError"));
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { firstname: form.firstname, lastname: form.lastname } },
      });
      if (authError) throw new Error(authError.message);
      if (authData.user) {
        await supabase.from("users").upsert({
          id: authData.user.id, firstname: form.firstname, lastname: form.lastname,
          country: form.country || null, role: form.role,
          total_score: 0, quizzes_played: 0, accuracy: 0,
        });
      }
      await fetchUsers();
      setShowModal(false);
      setForm({ firstname: "", lastname: "", email: "", password: "", country: "", role: "user" });
    } catch (err: any) {
      setCreateError(err.message ?? t("modal.createError"));
    } finally {
      setCreating(false);
    }
  };

  const filtered = users.filter(u => {
    const name = `${u.firstname ?? ""} ${u.lastname ?? ""}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || (u.country ?? "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const tableHeaders = [
    { label: t("table.user"),     cls: "col-span-3" },
    { label: t("table.country"),  cls: "col-span-1 text-center" },
    { label: t("table.score"),    cls: "col-span-1 text-center" },
    { label: t("table.quizzes"),  cls: "col-span-1 text-center" },
    { label: t("table.accuracy"), cls: "col-span-1 text-center" },
    { label: t("table.role"),     cls: "col-span-1 text-center" },
    { label: t("table.actions"),  cls: "col-span-2 text-center" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{t("title")}</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{t("subtitle", { count: users.length })}</p>
        </div>
        <button onClick={() => { setShowModal(true); setCreateError(null); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 shadow-md shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95">
          {t("addBtn")}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t("search")}
            className="w-full ps-10 pe-4 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 text-sm rounded-xl cursor-pointer bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
          <option value="all">{t("filterRole")}</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 px-5 py-3 bg-gray-50 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-700">
          {tableHeaders.map(({ label, cls }) => (
            <div key={label} className={`${cls} text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500`}>{label}</div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 dark:text-slate-500 text-sm">{t("noResults")}</div>
        ) : (
          filtered.map(u => (
            <div key={u.id} className="grid grid-cols-12 px-5 py-4 items-center border-b border-gray-100 dark:border-slate-800 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {u.firstname?.[0] ?? "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {u.firstname ? `${u.firstname} ${u.lastname ?? ""}`.trim() : t("anonymous")}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{u.id.slice(0, 8)}...</p>
                </div>
              </div>
              <div className="col-span-1 text-center"><span className="text-sm text-gray-700 dark:text-slate-300">{u.country ?? "—"}</span></div>
              <div className="col-span-1 text-center"><span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{(u.total_score ?? 0).toLocaleString()}</span></div>
              <div className="col-span-1 text-center"><span className="text-sm text-gray-700 dark:text-slate-300">{u.quizzes_played ?? 0}</span></div>
              <div className="col-span-1 text-center"><span className="text-sm text-gray-700 dark:text-slate-300">{u.accuracy ?? 0}%</span></div>
              <div className="col-span-1 text-center">
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  u.role === "admin" ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400" : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300"
                }`}>{u.role ?? "user"}</span>
              </div>
              <div className="col-span-2 flex items-center justify-center gap-2">
                <button onClick={() => updateRole(u.id, u.role === "admin" ? "user" : "admin")} disabled={updating === u.id}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    u.role === "admin"
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      : "bg-cyan-50 text-cyan-600 hover:bg-cyan-100 dark:bg-cyan-500/20 dark:text-cyan-400 dark:hover:bg-cyan-500/30"
                  }`}>
                  {updating === u.id ? "..." : u.role === "admin" ? t("actions.toUser") : t("actions.toAdmin")}
                </button>
                <button onClick={() => deleteUser(u.id)}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-all">
                  {t("actions.delete")}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl shadow-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 p-6 space-y-5 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">{t("modal.title")}</h2>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{t("modal.subtitle")}</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all">✕</button>
            </div>

            {createError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400">
                <span>⚠️</span>{createError}
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "firstname", label: t("modal.firstname"), placeholder: t("modal.firstnamePlaceholder"), required: true },
                  { key: "lastname",  label: t("modal.lastname"),  placeholder: t("modal.lastnamePlaceholder"),  required: false },
                ].map(({ key, label, placeholder, required }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                      {label} {required && <span className="text-red-500">{t("modal.required")}</span>}
                    </label>
                    <input type="text" value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                  </div>
                ))}
              </div>

              {[
                { key: "email",    label: t("modal.email"),    placeholder: t("modal.emailPlaceholder"),    type: "email",    required: true },
                { key: "password", label: t("modal.password"), placeholder: "••••••••",                     type: "password", required: true },
              ].map(({ key, label, placeholder, type, required }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                    {label} {required && <span className="text-red-500">{t("modal.required")}</span>}
                  </label>
                  <input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">{t("modal.country")}</label>
                  <input type="text" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    placeholder={t("modal.countryPlaceholder")}
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">{t("modal.role")}</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm rounded-xl cursor-pointer bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700">
                {t("modal.cancel")}
              </button>
              <button onClick={handleCreateUser} disabled={creating}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20">
                {creating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t("modal.creating")}
                  </span>
                ) : t("modal.create")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}