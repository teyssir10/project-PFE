"use client"
// app/admin/users/page.tsx
import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import {
  SearchOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

export default function UsersPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [users,   setUsers]   = useState<any[]>([])
  const [search,  setSearch]  = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .order("created_at", { ascending: false })
    if (data) setUsers(data)
    setLoading(false)
  }

  const updateRole = async (id: string, role: string) => {
    await supabase.from("profiles").update({ role }).eq("id", id)
    setUsers(users.map((u) => u.id === id ? { ...u, role } : u))
  }

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user permanently?")) return
    await supabase.from("profiles").delete().eq("id", id)
    setUsers(users.filter((u) => u.id !== id))
  }

  const filtered = users.filter((u) =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const roleColor = (role: string) => ({
    admin:   { bg: "#fef2f2", color: "#ef4444" },
    teacher: { bg: "#eef2ff", color: "#6366f1" },
    user:    { bg: "#f0fdfa", color: "#0d9488" },
  }[role] ?? { bg: "#f1f5f9", color: "#64748b" })

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0d9488", margin: 0 }}>
          Users Management
        </h1>
        <p style={{ color: "#64748b", margin: "4px 0 0" }}>
          {users.length} total users
        </p>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1.5rem", maxWidth: 400 }}>
        <SearchOutlined style={{
          position: "absolute", left: 12, top: "50%",
          transform: "translateY(-50%)", color: "#94a3b8"
        }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
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
              {["Name", "Email", "Role", "Joined", "Actions"].map((h) => (
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
              <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
                Loading...
              </td></tr>
            ) : filtered.map((u) => {
              const rc = roleColor(u.role)
              return (
                <tr key={u.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 600, fontSize: 14 }}>
                    {u.full_name || "—"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "#64748b", fontSize: 14 }}>
                    {u.email}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                      style={{
                        padding: "0.3rem 0.6rem", borderRadius: 6,
                        border: `1px solid ${rc.color}40`,
                        background: rc.bg, color: rc.color,
                        fontWeight: 700, fontSize: 13, cursor: "pointer",
                      }}>
                      <option value="user">user</option>
                      <option value="teacher">teacher</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "#94a3b8", fontSize: 13 }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <button
                      onClick={() => deleteUser(u.id)}
                      style={{
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