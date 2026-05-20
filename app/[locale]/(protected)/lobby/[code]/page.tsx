"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";
import QRCode from "qrcode";
import { Spin } from "antd";
import { LobbyPlayer } from "@/types/quiz";
import { fetchPlayersWithNames, leaveRoom, closeRoom, upsertPlayer, insertGameState } from "@/lib/api/multiplayer";

export default function LobbyPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const t = useTranslations("lobby");

  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [room, setRoom] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [quitting, setQuitting] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [showConfirm, setShowConfirm] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/lobby/${code}`
    : "";

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setCurrentUser(user);

      const { data: roomData, error: roomError } = await supabase
        .from("rooms").select("*").eq("code", code).single();

      if (roomError || !roomData) { router.push("/multiplayerroom"); return; }

      if (roomData.status === "finished" || roomData.status === "playing") {
        router.replace("/dashboard");
        return;
      }
      setRoom(roomData);
      setIsHost(user.id === roomData.host_id);
      await upsertPlayer(user.id, roomData.id);
      setPlayers(await fetchPlayersWithNames(roomData.id));
      setLoading(false);
    };

    init();
  }, [code]);

  useEffect(() => {
    if (!shareUrl || loading) return;
    QRCode.toDataURL(shareUrl, {
      width: 140, margin: 1,
      color: { dark: "#003333", light: "#ffffff" },
    }).then(url => setQrDataUrl(url));
  }, [shareUrl, loading]);

  useEffect(() => {
    if (!room) return;
    const refresh = async () => setPlayers(await fetchPlayersWithNames(room.id));
    const channel = supabase
      .channel(`room-players-${room.id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "players",
        filter: `room_id=eq.${room.id}`,
      }, refresh)
      .subscribe();
    const interval = setInterval(refresh, 3000);
    return () => { supabase.removeChannel(channel); clearInterval(interval); };
  }, [room]);

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

  useEffect(() => {
    if (!room) return;
    const channel = supabase
      .channel(`room-status-${room.id}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "rooms",
        filter: `id=eq.${room.id}`,
      }, ({ new: updatedRoom }) => {
        if (updatedRoom.status === "finished") router.replace("/dashboard");
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [room]);

  const handleStartGame = async () => {
    setStarting(true);
    try {
      await insertGameState(room.id);
      router.push(`/play-quiz/${room.quiz_id}/play?roomId=${room.id}`);
    } catch (e) {
      console.error("Start game error:", e);
      setStarting(false);
    }
  };

  const handleQuit = async () => {
    if (!currentUser || !room) return;
    setQuitting(true);
    try {
      if (isHost) await closeRoom(room.id);
      else        await leaveRoom(currentUser.id, room.id);
      router.replace("/dashboard");
    } catch (e) {
      console.error("Quit error:", e);
      setQuitting(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nonHostPlayers = players.filter(p => p.user_id !== room?.host_id);
  const avatarColors = [
    "from-cyan-400 to-teal-500",
    "from-violet-400 to-purple-500",
    "from-orange-400 to-pink-500",
    "from-green-400 to-emerald-500",
    "from-blue-400 to-indigo-500",
    "from-rose-400 to-red-500",
  ];

  if (loading) return (
    <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-cyan-500 uppercase tracking-widest mb-1">
              {t("header.label")}
            </p>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {isHost ? t("header.hostTitle") : t("header.guestTitle")}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {t("header.playerCount", { count: players.length })}
              </span>
            </div>

            <button
              onClick={() => setShowConfirm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {isHost ? t("actions.closeRoom") : t("actions.leave")}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                {t("share.codeLabel")}
              </p>
              <div className="bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl p-4 text-center shadow-lg shadow-cyan-500/20">
                <p className="text-3xl font-black text-white tracking-[0.3em] font-mono select-all">{code}</p>
                <p className="text-xs text-cyan-100 mt-1">{t("share.codeHint")}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                {t("share.qrLabel")}
              </p>
              <div className="flex justify-center">
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  {qrDataUrl
                    ? <img src={qrDataUrl} alt="QR Code" className="rounded-lg w-[140px] h-[140px]" />
                    : <div className="w-[140px] h-[140px] bg-gray-100 dark:bg-slate-700 rounded-lg animate-pulse" />
                  }
                </div>
              </div>
              <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">{t("share.qrHint")}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                {t("share.linkLabel")}
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-mono">{shareUrl}</p>
                </div>
                <button
                  onClick={copyLink}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200
                    ${copied
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 border border-green-200"
                      : "bg-cyan-500 text-white hover:bg-cyan-600"
                    }`}
                >
                  {copied ? t("share.copied") : t("share.copy")}
                </button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {t("players.title", { count: players.length })}
                </p>
                <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  {t("players.waiting", { count: nonHostPlayers.length })}
                </span>
              </div>

              {players.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-3xl mb-2">👀</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">{t("players.empty")}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {players.map((player, idx) => {
                    const isMe         = player.user_id === currentUser?.id;
                    const isPlayerHost = player.user_id === room?.host_id;
                    return (
                      <div
                        key={player.id}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                          ${isMe
                            ? "bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800"
                            : "bg-gray-50 dark:bg-slate-700/50 border border-transparent"
                          }`}
                      >
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                          {player.displayInitial}
                        </div>
                        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                            {player.displayName}
                          </span>
                          {isMe && (
                            <span className="text-xs bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-full font-medium">
                              {t("players.you")}
                            </span>
                          )}
                          {isPlayerHost && (
                            <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                              👑 {t("players.host")}
                            </span>
                          )}
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0
                          ${isPlayerHost
                            ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                            : "bg-gray-100 dark:bg-slate-600 text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          {isPlayerHost
                            ? <><span>👑</span><span>{t("players.host")}</span></>
                            : <><span>⏳</span><span>{t("players.waitingStatus")}</span></>
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 space-y-3">
              {!isHost && (
                <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                  {t("actions.waitingForHost")}
                </p>
              )}

              {isHost && (
                <>
                  <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                    <span>⏳</span>
                    <span>
                      {nonHostPlayers.length === 0
                        ? t("actions.waitingForPlayers")
                        : t("actions.playersInRoom", { count: nonHostPlayers.length })}
                    </span>
                  </div>

                  <button
                    onClick={handleStartGame}
                    disabled={starting || players.length < 2}
                    className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-teal-400 text-white hover:shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {starting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t("actions.starting")}
                      </>
                    ) : t("actions.startGame")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/*Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
             onClick={() => setShowConfirm(false)}>
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 w-full max-w-sm p-6 space-y-4"
            onClick={e => e.stopPropagation()}
            >
            <div className="text-center">
              <div className="text-4xl mb-3">{isHost ? "🔒" : "👋"}</div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">
                {isHost ? t("confirm.hostTitle") : t("confirm.guestTitle")}
              </h2>
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                {isHost ? t("confirm.hostMessage") : t("confirm.guestMessage")}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
              >
                {t("confirm.cancel")}
              </button>
              <button
                onClick={handleQuit}
                disabled={quitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-400 to-red-600 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {quitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("confirm.processing")}
                  </>
                ) : isHost ? t("confirm.hostConfirm") : t("confirm.guestConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}