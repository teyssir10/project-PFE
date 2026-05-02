"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import {
  TeamOutlined,
  BookOutlined,
  FlagOutlined,
  LineChartOutlined,
  UserOutlined,
  ReadOutlined,
} from "@ant-design/icons";

export default function AdminDashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [stats, setStats] = useState({
    total_users:      0,
    total_teachers:   0,
    total_quizzes:    0,
    pending_quizzes:  0,
    pending_reports:  0,
    new_users_week:   0,
    published_quizzes: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentUsers,   setRecentUsers]   = useState<any[]>([])
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([])

  useEffect(() => {
    const fetchAll = async () => {
      // Stats
      const { data: s } = await supabase
        .from("admin_stats").select("*").single()
      if (s) setStats(s)

      // Recent users
      const { data: u } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at")
        .order("created_at", { ascending: false })
        .limit(5)
      if (u) setRecentUsers(u)

      // Recent quizzes
      const { data: q } = await supabase
        .from("quizzes")
        .select("id, title, creator_name, is_published, created_at")
        .order("created_at", { ascending: false })
        .limit(5)
      if (q) setRecentQuizzes(q)

      setLoading(false)
    }
    fetchAll()
  }, [])

  const cards = [
    { label: "Total Users",       value: stats.total_users,       icon: TeamOutlined,      color: "#0d9488", bg: "#f0fdfa" },
    { label: "Teachers",          value: stats.total_teachers,    icon: UserOutlined,  color: "#6366f1", bg: "#eef2ff" },
    { label: "Total Quizzes",     value: stats.total_quizzes,     icon: BookOutlined,   color: "#f59e0b", bg: "#fffbeb" },
    { label: "Pending Quizzes",   value: stats.pending_quizzes,   icon: ReadOutlined, color: "#f97316", bg: "#fff7ed" },
    { label: "Pending Reports",   value: stats.pending_reports,   icon: FlagOutlined,       color: "#ef4444", bg: "#fef2f2" },
    { label: "New Users (7d)",    value: stats.new_users_week,    icon: LineChartOutlined, color: "#10b981", bg: "#ecfdf5" },
  ]

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center",
                  justifyContent: "center", height: "60vh" }}>
      <p style={{ color: "#0d9488", fontSize: 18 }}>Loading...</p>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0d9488", margin: 0 }}>
          Welcome back, <span style={{ color: "#0f172a" }}>Admin</span> 👑
        </h1>
        <p style={{ color: "#64748b", margin: "4px 0 0" }}>
          Platform overview — everything at a glance
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16,
        marginBottom: "2rem"
      }}>
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{
            background: "#fff",
            borderRadius: 12,
            padding: "1.25rem 1.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}>
            <div style={{ background: bg, borderRadius: 10, padding: 12 }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>{label}</p>
              <p style={{ fontSize: 30, fontWeight: 800, color, margin: "2px 0 0" }}>
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Users + Recent Quizzes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Recent Users */}
        <div style={{ background: "#fff", borderRadius: 12,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
            <h3 style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>
              Recent Users
            </h3>
          </div>
          {recentUsers.map((u) => (
            <div key={u.id} style={{
              padding: "0.75rem 1.5rem",
              borderBottom: "1px solid #f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{u.full_name}</p>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: 12 }}>{u.email}</p>
              </div>
              <span style={{
                padding: "0.2rem 0.6rem",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                background: u.role === "admin" ? "#fef2f2" : u.role === "teacher" ? "#eef2ff" : "#f0fdfa",
                color:      u.role === "admin" ? "#ef4444" : u.role === "teacher" ? "#6366f1" : "#0d9488",
              }}>
                {u.role}
              </span>
            </div>
          ))}
        </div>

        {/* Recent Quizzes */}
        <div style={{ background: "#fff", borderRadius: 12,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
            <h3 style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>
              Recent Quizzes
            </h3>
          </div>
          {recentQuizzes.map((q) => (
            <div key={q.id} style={{
              padding: "0.75rem 1.5rem",
              borderBottom: "1px solid #f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{q.title}</p>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: 12 }}>
                  by {q.creator_name}
                </p>
              </div>
              <span style={{
                padding: "0.2rem 0.6rem",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                background: q.is_published ? "#dcfce7" : "#fef9c3",
                color:      q.is_published ? "#16a34a" : "#ca8a04",
              }}>
                {q.is_published ? "published" : "pending"}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}