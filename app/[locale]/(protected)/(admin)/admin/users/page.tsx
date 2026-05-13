"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    country: "",
    role: "user",
  });
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
    if (!confirm("Supprimer cet utilisateur ?")) return;
    await supabase.from("users").delete().eq("id", userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleCreateUser = async () => {
    if (!form.email || !form.password || !form.firstname) {
      setCreateError("Prénom, email et mot de passe sont requis.");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            firstname: form.firstname,
            lastname: form.lastname,
          },
        },
      });

      if (authError) throw new Error(authError.message);

      if (authData.user) {
        await supabase.from("users").upsert({
          id: authData.user.id,
          firstname: form.firstname,
          lastname: form.lastname,
          country: form.country || null,
          role: form.role,
          total_score: 0,
          quizzes_played: 0,
          accuracy: 0,
        });
      }

   
      await fetchUsers();
      setShowModal(false);
      setForm({ firstname: "", lastname: "", email: "", password: "", country: "", role: "user" });
    } catch (err: any) {
      setCreateError(err.message ?? "Erreur lors de la création.");
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

  return (
    <div className="space-y-6">

     
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Utilisateurs</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{users.length} utilisateurs au total</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setCreateError(null); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white
            bg-gradient-to-r from-cyan-500 to-teal-400
            hover:from-cyan-400 hover:to-teal-300
            shadow-md shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <span className="text-base leading-none">+</span>
          Ajouter un utilisateur
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou pays..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl
              bg-white dark:bg-slate-900
              border border-gray-200 dark:border-slate-700
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-slate-500
              focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 text-sm rounded-xl cursor-pointer
            bg-white dark:bg-slate-900
            border border-gray-200 dark:border-slate-700
            text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="all">Tous les rôles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-12 px-5 py-3 bg-gray-50 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-700">
          {["Utilisateur", "Pays", "Score", "Quiz", "Précision", "Rôle", "Actions"].map((h, i) => (
            <div key={h} className={`text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 ${
              i === 0 ? "col-span-3" : i === 6 ? "col-span-2 text-center" : "col-span-1 text-center"
            }`}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 dark:text-slate-500 text-sm">Aucun utilisateur trouvé</div>
        ) : (
          filtered.map(u => (
            <div key={u.id} className="grid grid-cols-12 px-5 py-4 items-center border-b border-gray-100 dark:border-slate-800 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {u.firstname?.[0] ?? "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {u.firstname ? `${u.firstname} ${u.lastname ?? ""}`.trim() : "Anonyme"}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{u.id.slice(0, 8)}...</p>
                </div>
              </div>

              <div className="col-span-1 text-center">
                <span className="text-sm text-gray-700 dark:text-slate-300">{u.country ?? "—"}</span>
              </div>
              <div className="col-span-1 text-center">
                <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{(u.total_score ?? 0).toLocaleString()}</span>
              </div>
              <div className="col-span-1 text-center">
                <span className="text-sm text-gray-700 dark:text-slate-300">{u.quizzes_played ?? 0}</span>
              </div>
              <div className="col-span-1 text-center">
                <span className="text-sm text-gray-700 dark:text-slate-300">{u.accuracy ?? 0}%</span>
              </div>

              <div className="col-span-1 text-center">
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  u.role === "admin"
                    ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                    : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300"
                }`}>
                  {u.role ?? "user"}
                </span>
              </div>

              <div className="col-span-2 flex items-center justify-center gap-2">
                <button
                  onClick={() => updateRole(u.id, u.role === "admin" ? "user" : "admin")}
                  disabled={updating === u.id}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    u.role === "admin"
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      : "bg-cyan-50 text-cyan-600 hover:bg-cyan-100 dark:bg-cyan-500/20 dark:text-cyan-400 dark:hover:bg-cyan-500/30"
                  }`}
                >
                  {updating === u.id ? "..." : u.role === "admin" ? "→ User" : "→ Admin"}
                </button>
                <button
                  onClick={() => deleteUser(u.id)}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-all"
                >
                  Suppr.
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

         
          <div className="relative w-full max-w-md rounded-2xl shadow-2xl
            bg-white dark:bg-slate-900
            border border-gray-100 dark:border-slate-700
            p-6 space-y-5 z-10">

        
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  Ajouter un utilisateur
                </h2>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                  Créer un nouveau compte utilisateur
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center
                  bg-gray-100 dark:bg-slate-800
                  text-gray-500 dark:text-slate-400
                  hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
              >
                ✕
              </button>
            </div>

        
            {createError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm
                bg-red-50 dark:bg-red-500/10
                border border-red-200 dark:border-red-500/20
                text-red-600 dark:text-red-400">
                <span>⚠️</span>
                {createError}
              </div>
            )}

         
            <div className="space-y-3">
         
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.firstname}
                    onChange={e => setForm(f => ({ ...f, firstname: e.target.value }))}
                    placeholder="Jean"
                    className="w-full px-3 py-2.5 text-sm rounded-xl
                      bg-gray-50 dark:bg-slate-800
                      border border-gray-200 dark:border-slate-700
                      text-gray-900 dark:text-white
                      placeholder-gray-300 dark:placeholder-slate-600
                      focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">Nom</label>
                  <input
                    type="text"
                    value={form.lastname}
                    onChange={e => setForm(f => ({ ...f, lastname: e.target.value }))}
                    placeholder="Dupont"
                    className="w-full px-3 py-2.5 text-sm rounded-xl
                      bg-gray-50 dark:bg-slate-800
                      border border-gray-200 dark:border-slate-700
                      text-gray-900 dark:text-white
                      placeholder-gray-300 dark:placeholder-slate-600
                      focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

           
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="jean@exemple.com"
                  className="w-full px-3 py-2.5 text-sm rounded-xl
                    bg-gray-50 dark:bg-slate-800
                    border border-gray-200 dark:border-slate-700
                    text-gray-900 dark:text-white
                    placeholder-gray-300 dark:placeholder-slate-600
                    focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  Mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 text-sm rounded-xl
                    bg-gray-50 dark:bg-slate-800
                    border border-gray-200 dark:border-slate-700
                    text-gray-900 dark:text-white
                    placeholder-gray-300 dark:placeholder-slate-600
                    focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

          
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">Pays</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    placeholder="France"
                    className="w-full px-3 py-2.5 text-sm rounded-xl
                      bg-gray-50 dark:bg-slate-800
                      border border-gray-200 dark:border-slate-700
                      text-gray-900 dark:text-white
                      placeholder-gray-300 dark:placeholder-slate-600
                      focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">Rôle</label>
                  <select
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm rounded-xl cursor-pointer
                      bg-gray-50 dark:bg-slate-800
                      border border-gray-200 dark:border-slate-700
                      text-gray-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

           
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all
                  bg-gray-100 dark:bg-slate-800
                  text-gray-600 dark:text-slate-300
                  hover:bg-gray-200 dark:hover:bg-slate-700
                  border border-gray-200 dark:border-slate-700"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateUser}
                disabled={creating}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all
                  bg-gradient-to-r from-cyan-500 to-teal-400
                  hover:from-cyan-400 hover:to-teal-300
                  disabled:opacity-60 disabled:cursor-not-allowed
                  shadow-md shadow-cyan-500/20"
              >
                {creating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Création...
                  </span>
                ) : "Créer l'utilisateur"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}