"use client"
// app/admin/quizzes/page.tsx
import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import {
  CheckCircleOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";

type Tab = "all" | "pending" | "published"

export default function QuizzesPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [tab,     setTab]     = useState<Tab>("all")
  const [search,  setSearch]  = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchQuizzes() }, [tab])

  const fetchQuizzes = async () => {
    setLoading(true)
    let query = supabase
      .from("quizzes")
      .select("id, title, creator_name, difficulty, is_published, status, created_at, question_count, players")
      .order("created_at", { ascending: false })

    if (tab === "pending")   query = query.eq("status", "pending")
    if (tab === "published") query = query.eq("is_published", true)

    const { data } = await query
    if (data) setQuizzes(data)
    setLoading(false)
  }

  const approveQuiz = async (id: string) => {
    await supabase.from("quizzes")
      .update({ status: "published", is_published: true })
      .eq("id", id)
    setQuizzes(quizzes.map((q) =>
      q.id === id ? { ...q, status: "published", is_published: true } : q
    ))
  }

  const deleteQuiz = async (id: string) => {
    if (!confirm("Delete this quiz permanently?")) return
    await supabase.from("quizzes").delete().eq("id", id)
    setQuizzes(quizzes.filter((q) => q.id !== id))
  }

  const filtered = quizzes.filter((q) =>
    q.title?.toLowerCase().includes(search.toLowerCase()) ||
    q.creator_name?.toLowerCase().includes(search.toLowerCase())
  )

  const tabs: { key: Tab; label: string }[] = [
    { key: "all",       label: "All Quizzes" },
    { key: "pending",   label: "⏳ Pending" },
    { key: "published", label: "✅ Published" },
  ]

  const statusStyle = (q: any) => q.is_published
    ? { bg: "#dcfce7", color: "#16a34a", label: "published" }
    : q.status === "pending"
    ? { bg: "#fef9c3", color: "#ca8a04", label: "pending" }
    : { bg: "#f1f5f9", color: "#64748b", label: "draft" }

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0d9488", margin: 0 }}>
          Quiz Management
        </h1>
        <p style={{ color: "#64748b", margin: "4px 0 0" }}>
          {quizzes.length} quizzes
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem" }}>
        {tabs.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: "0.5rem 1.2rem", borderRadius: 8,
            background: tab === key ? "#0d9488" : "#f1f5f9",
            color:      tab === key ? "#fff"    : "#64748b",
            border: "none", cursor: "pointer",
            fontWeight: 600, fontSize: 14,
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1.25rem", maxWidth: 400 }}>
        <SearchOutlined style={{
          position: "absolute", left: 12, top: "50%",
          transform: "translateY(-50%)", color: "#94a3b8"
        }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search quizzes..."
          style={{
            width: "100%", padding: "0.65rem 0.75rem 0.65rem 2.25rem",
            borderRadius: 8, border: "1px solid #e2e8f0",
            fontSize: 14, outline: "none", background: "#fff",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Title", "Creator", "Difficulty", "Questions", "Status", "Actions"].map((h) => (
                <th key={h} style={{
                  padding: "0.75rem 1rem", textAlign: "left",
                  fontSize: 13, color: "#64748b", fontWeight: 600,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
                Loading...
              </td></tr>
            ) : filtered.map((q) => {
              const ss = statusStyle(q)
              return (
                <tr key={q.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 600, fontSize: 14 }}>
                    {q.title}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "#64748b", fontSize: 14 }}>
                    {q.creator_name}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{
                      padding: "0.2rem 0.6rem", borderRadius: 20,
                      fontSize: 12, fontWeight: 600,
                      background: q.difficulty === "hard" ? "#fee2e2" :
                                  q.difficulty === "medium" ? "#fef9c3" : "#dcfce7",
                      color:      q.difficulty === "hard" ? "#ef4444" :
                                  q.difficulty === "medium" ? "#ca8a04" : "#16a34a",
                    }}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "#64748b", fontSize: 14 }}>
                    {q.question_count}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{
                      padding: "0.2rem 0.6rem", borderRadius: 20,
                      fontSize: 12, fontWeight: 600,
                      background: ss.bg, color: ss.color,
                    }}>
                      {ss.label}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", display: "flex", gap: 8 }}>
                    {!q.is_published && (
                      <button onClick={() => approveQuiz(q.id)} style={{
                        padding: "0.35rem 0.75rem", borderRadius: 6,
                        background: "#dcfce7", color: "#16a34a",
                        border: "none", cursor: "pointer",
                        fontWeight: 600, fontSize: 13,
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        <CheckCircleOutlined size={13} /> Approve
                      </button>
                    )}
                    <button onClick={() => deleteQuiz(q.id)} style={{
                      padding: "0.35rem 0.75rem", borderRadius: 6,
                      background: "#fee2e2", color: "#ef4444",
                      border: "none", cursor: "pointer",
                      fontWeight: 600, fontSize: 13,
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                      <DeleteOutlined size={13} /> Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}