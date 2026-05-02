"use client"
// app/admin/moderation/page.tsx
import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FlagOutlined,
} from "@ant-design/icons";

export default function ModerationPage() {
  const supabase  = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [reports, setReports]  = useState<any[]>([])
  const [loading, setLoading]  = useState(true)
  const [tab,     setTab]      = useState<"pending" | "resolved" | "dismissed">("pending")

  useEffect(() => { fetchReports() }, [tab])

  const fetchReports = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("reports")
      .select("*, profiles!reporter_id(full_name, email)")
      .eq("status", tab)
      .order("created_at", { ascending: false })
    if (data) setReports(data)
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("reports").update({ status }).eq("id", id)
    setReports(reports.filter((r) => r.id !== id))
  }

  const counts = { pending: 0, resolved: 0, dismissed: 0 }

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0d9488", margin: 0 }}>
          Moderation
        </h1>
        <p style={{ color: "#64748b", margin: "4px 0 0" }}>
          Review and manage reported content
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        {(["pending", "resolved", "dismissed"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "0.5rem 1.2rem", borderRadius: 8,
            background: tab === t ? "#0d9488" : "#f1f5f9",
            color:      tab === t ? "#fff"    : "#64748b",
            border: "none", cursor: "pointer",
            fontWeight: 600, fontSize: 14, textTransform: "capitalize",
          }}>
            {t === "pending" ? `🚨 ${t}` : t === "resolved" ? `✅ ${t}` : `❌ ${t}`}
          </button>
        ))}
      </div>

      {/* Reports list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: "2rem" }}>Loading...</p>
        ) : reports.length === 0 ? (
          <div style={{
            background: "#fff", borderRadius: 12, padding: "3rem",
            textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.07)"
          }}>
            <FlagOutlined style={{ fontSize: 32, color: "#94a3b8", marginBottom: 8 }} />
            <p style={{ color: "#94a3b8", margin: 0 }}>No {tab} reports</p>
          </div>
        ) : reports.map((r) => (
          <div key={r.id} style={{
            background: "#fff", borderRadius: 12,
            padding: "1.25rem 1.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{
                  padding: "0.2rem 0.6rem", borderRadius: 20,
                  fontSize: 12, fontWeight: 700,
                  background: r.target_type === "quiz" ? "#eff6ff" : "#fef2f2",
                  color:      r.target_type === "quiz" ? "#3b82f6" : "#ef4444",
                }}>
                  {r.target_type}
                </span>
                <span style={{ color: "#94a3b8", fontSize: 12 }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 15 }}>
                {r.reason}
              </p>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
                Reported by: {r.profiles?.full_name || r.profiles?.email || "Unknown"}
              </p>
            </div>

            {tab === "pending" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => updateStatus(r.id, "resolved")} style={{
                  padding: "0.4rem 1rem", borderRadius: 8,
                  background: "#dcfce7", color: "#16a34a",
                  border: "none", cursor: "pointer",
                  fontWeight: 700, fontSize: 13,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <CheckCircleOutlined size={14} /> Resolve
                </button>
                <button onClick={() => updateStatus(r.id, "dismissed")} style={{
                  padding: "0.4rem 1rem", borderRadius: 8,
                  background: "#fee2e2", color: "#ef4444",
                  border: "none", cursor: "pointer",
                  fontWeight: 700, fontSize: 13,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <CloseCircleOutlined size={14} /> Dismiss
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}