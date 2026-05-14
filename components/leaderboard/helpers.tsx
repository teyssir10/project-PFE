// ─── Types ───────────────────────────────────────────────────────────────────
export type FilterType = "score" | "accuracy" | "quizzes";

// ─── Avatar colors ────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "from-cyan-400 to-teal-500",
  "from-violet-400 to-purple-500",
  "from-amber-400 to-orange-500",
  "from-pink-400 to-rose-500",
  "from-emerald-400 to-green-500",
  "from-blue-400 to-indigo-500",
];

export function avatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── Display helpers ──────────────────────────────────────────────────────────
import { LeaderboardUser } from "@/lib/api/leaderboard";

export function getInitials(user: LeaderboardUser) {
  const f = user.firstname?.[0] ?? "";
  const l = user.lastname?.[0] ?? "";
  return (f + l).toUpperCase() || "?";
}

export function getDisplayName(user: LeaderboardUser, anonymous: string) {
  if (user.firstname) return `${user.firstname} ${user.lastname ?? ""}`.trim();
  return anonymous;
}

export function getDisplayValue(user: LeaderboardUser, filter: FilterType) {
  if (filter === "accuracy") return `${user.accuracy ?? 0}%`;
  if (filter === "quizzes")  return String(user.quizzes_played ?? 0);
  return (user.total_score ?? 0).toLocaleString();
}

const FLAGS: Record<string, string> = {
  Tunisia: "🇹🇳", France: "🇫🇷", Algeria: "🇩🇿", Morocco: "🇲🇦",
  Egypt: "🇪🇬", Germany: "🇩🇪", Spain: "🇪🇸", Italy: "🇮🇹",
  USA: "🇺🇸", UK: "🇬🇧", Canada: "🇨🇦", Brazil: "🇧🇷",
};
export function flag(country: string | null) {
  return country ? (FLAGS[country] ?? "🌐") : "🌐";
}

// ─── Avatar component ─────────────────────────────────────────────────────────
export function Avatar({ user, size = "md" }: { user: LeaderboardUser; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "w-20 h-20 text-2xl"
           : size === "md" ? "w-12 h-12 text-base"
                           : "w-9 h-9 text-xs";
  return (
    <div className={`${sz} rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br ${avatarColor(user.id)} flex-shrink-0 shadow-md`}>
      {user.avatar_url
        ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
        : getInitials(user)
      }
    </div>
  );
}