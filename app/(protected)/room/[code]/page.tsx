"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import QRCode from "qrcode";
import { Spin } from "antd";

export default function RoomPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();

  const [players, setPlayers] = useState<any[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [room, setRoom] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/room/${code}`
    : "";

  // ─── 1. Init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setCurrentUser(user);

      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", code)
        .single();

      if (roomError || !roomData) { router.push("/multiplayerroom"); return; }
      setRoom(roomData);

      const hostCheck = user.id === roomData.host_id;
      setIsHost(hostCheck);

      await supabase.from("players").upsert(
        { user_id: user.id, room_id: roomData.id, is_ready: hostCheck },
        { onConflict: "user_id,room_id" }
      );

      await fetchPlayers(roomData.id);
      setLoading(false);
    };

    init();
  }, [code]);

  // ─── 2. QR Code ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!shareUrl || loading) return;
    QRCode.toDataURL(shareUrl, {
      width: 140,
      margin: 1,
      color: { dark: "#003333", light: "#ffffff" },
    }).then(url => setQrDataUrl(url));
  }, [shareUrl, loading]);

  // ─── 3. fetchPlayers — noms embarqués dans chaque player ──────────────────
  const fetchPlayers = async (roomId: string) => {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", roomId)
      .order("joined_at", { ascending: true });

    if (error) { console.error("Fetch players error:", error.message); return; }
    if (!data || data.length === 0) { setPlayers([]); return; }

    const userIds = data.map(p => p.user_id);

    const { data: usersData } = await supabase
      .from("users")
      .select("id, firstname, lastname")
      .in("id", userIds);

    // Merge nom directement dans chaque player object
    const playersWithNames = data.map(player => {
      const user = (usersData || []).find(u => u.id === player.user_id);
      return {
        ...player,
        displayName: user
          ? `${user.firstname} ${user.lastname || ""}`.trim()
          : player.user_id?.slice(0, 8) + "...",
        displayInitial: user
          ? user.firstname.charAt(0).toUpperCase()
          : "?",
      };
    });

    setPlayers(playersWithNames);
  };

  // ─── 4. Realtime — players ────────────────────────────────────────────────
  useEffect(() => {
    if (!room) return;
    const channel = supabase
      .channel(`room-players-${room.id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "players",
        filter: `room_id=eq.${room.id}`,
      }, () => fetchPlayers(room.id))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [room]);

  // ─── 5. Realtime — game_state → redirect all ──────────────────────────────
  useEffect(() => {
    if (!room) return;
    const channel = supabase
      .channel(`game-start-${room.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "game_state",
        filter: `room_id=eq.${room.id}`,
      }, () => router.push(`/play-quiz/${room.quiz_id}/play?roomId=${room.id}`))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [room]);

  // ─── 6. Actions ───────────────────────────────────────────────────────────
  const toggleReady = async () => {
    if (!currentUser || !room) return;
    const me = players.find(p => p.user_id === currentUser.id);
    if (!me) return;
    await supabase.from("players")
      .update({ is_ready: !me.is_ready })
      .eq("id", me.id);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startGame = async () => {
    setStarting(true);
    const { error } = await supabase.from("game_state").insert({
      room_id: room.id,
      current_question_index: 0,
      question_start_time: new Date().toISOString(),
      status: "playing",
    });
    if (error) {
      console.error("Start game error:", error.message);
      setStarting(false);
      return;
    }
    router.push(`/play-quiz/${room.quiz_id}/play?roomId=${room.id}`);
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const getName = (player: any) => player.displayName || player.user_id?.slice(0, 8) + "...";
  const getInitial = (player: any) => player.displayInitial || "?";

  const me = players.find(p => p.user_id === currentUser?.id);
  const nonHostPlayers = players.filter(p => p.user_id !== room?.host_id);
  const readyCount = nonHostPlayers.filter(p => p.is_ready).length;
  const allReady = nonHostPlayers.length > 0 && readyCount === nonHostPlayers.length;

  const avatarColors = [
    "from-cyan-400 to-teal-500",
    "from-violet-400 to-purple-500",
    "from-orange-400 to-pink-500",
    "from-green-400 to-emerald-500",
    "from-blue-400 to-indigo-500",
    "from-rose-400 to-red-500",
  ];

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spin className="" size="large" />
      </div>
    </div>
  );

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen  relative overflow-hidden">

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-cyan-400/10 dark:bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-teal-400/10 dark:bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-cyan-500 uppercase tracking-widest mb-1">
              Waiting Room
            </p>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {isHost ? "You are the host 👑" : "Waiting for the game to start..."}
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {players.length} player{players.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* LEFT */}
          <div className="space-y-4">

            {/* Room Code */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Room Code
              </p>
              <div className="bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl p-4 text-center shadow-lg shadow-cyan-500/20">
                <p className="text-3xl font-black text-white tracking-[0.3em] font-mono select-all">
                  {code}
                </p>
                <p className="text-xs text-cyan-100 mt-1">Share this code with your friends</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                QR Code
              </p>
              <div className="flex justify-center">
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  {qrDataUrl
                    ? <img src={qrDataUrl} alt="QR Code" className="rounded-lg w-[140px] h-[140px]" />
                    : <div className="w-[140px] h-[140px] bg-gray-100 dark:bg-slate-700 rounded-lg animate-pulse" />
                  }
                </div>
              </div>
              <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">Scan to join</p>
            </div>

            {/* Share Link */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Invite Link
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-mono">
                    {shareUrl}
                  </p>
                </div>
                <button
                  onClick={copyLink}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200
                    ${copied
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 border border-green-200"
                      : "bg-cyan-500 text-white hover:bg-cyan-600"
                    }`}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2 space-y-4">

            {/* Players List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Players ({players.length})
                </p>
                <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  {readyCount}/{nonHostPlayers.length} ready
                </span>
              </div>

              {players.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-3xl mb-2">👀</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Waiting for players to join...
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {players.map((player, idx) => {
                    const isMe = player.user_id === currentUser?.id;
                    const isPlayerHost = player.user_id === room?.host_id;
                    return (
                      <div key={player.id}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                          ${isMe
                            ? "bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800"
                            : "bg-gray-50 dark:bg-slate-700/50 border border-transparent"
                          }`}
                      >
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                          {getInitial(player)}
                        </div>

                        {/* Name + badges */}
                        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                            {getName(player)}
                          </span>
                          {isMe && (
                            <span className="text-xs bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-full font-medium">
                              You
                            </span>
                          )}
                          {isPlayerHost && (
                            <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                              👑 Host
                            </span>
                          )}
                        </div>

                        {/* Ready status */}
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0
                          ${isPlayerHost
                            ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                            : player.is_ready
                            ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                            : "bg-gray-100 dark:bg-slate-600 text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          {isPlayerHost
                            ? <><span>👑</span><span>Host</span></>
                            : player.is_ready
                            ? <><span>✅</span><span>Ready</span></>
                            : <><span>⏳</span><span>Waiting</span></>
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 space-y-3">

              {/* Guest: Ready button */}
              {!isHost && me && (
                <button onClick={toggleReady}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200
                    ${me.is_ready
                      ? "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                      : "bg-gradient-to-r from-cyan-500 to-teal-400 text-white hover:shadow-lg hover:-translate-y-0.5"
                    }`}
                >
                  {me.is_ready ? "⏳ Cancel ready" : "✅ I'm ready!"}
                </button>
              )}

              {!isHost && (
                <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                  Waiting for the host to start the game...
                </p>
              )}

              {/* Host: status + start */}
              {isHost && (
                <>
                  <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl
                    ${allReady
                      ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                      : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    <span>{allReady ? "✅" : "⏳"}</span>
                    <span>
                      {nonHostPlayers.length === 0
                        ? "Waiting for at least one player to join..."
                        : allReady
                        ? "All players are ready!"
                        : `${readyCount}/${nonHostPlayers.length} players ready`}
                    </span>
                  </div>

                  <button
                    onClick={startGame}
                    disabled={starting || players.length < 2}
                    className="w-full py-3.5 rounded-xl font-bold text-sm
                      bg-gradient-to-r from-cyan-500 to-teal-400 text-white
                      hover:shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-0.5
                      transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center justify-center gap-2"
                  >
                    {starting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Starting...
                      </>
                    ) : "🚀 Start the game"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}