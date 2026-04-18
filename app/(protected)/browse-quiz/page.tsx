"use client";

import React, { useState } from "react";
import QuizCard from "@/components/UI/QuizCard/quiz-card";
import { SearchOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { fetchQuizzes } from "@/lib/api/quiz";
import { fetchFavorites, addFavorite, removeFavorite } from "@/lib/api/favorites";
import { useAuth } from "@/lib/auth";

const tabs = [
  { key: "all", label: "All quizzes" },
  { key: "community", label: "Community" },
  { key: "my", label: "My quizzes" },
  { key: "favorites", label: "Favourites" },
  { key: "recent", label: "Recently played" },
];


export default function QuizPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
  const loadData = async () => {
    try {
      const quizzesData = await fetchQuizzes();
      setQuizzes(quizzesData);

      if (user) {
        const favs = await fetchFavorites(user.id);
        setFavorites(favs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [user]);

const toggleFavorite = async (id: string) => {
  try {
    if (favorites.includes(id)) {
      await removeFavorite(id);
      setFavorites(prev => prev.filter(f => f !== id));
    } else {
      await addFavorite(id);
      setFavorites(prev => [...prev, id]);
    }
  } catch (err) {
    console.error(err);
  }
};
const filtered = quizzes.filter((q) => {
  const matchSearch = q.title.toLowerCase().includes(search.toLowerCase());

  if (tab === "all") return matchSearch;
  if (tab === "community") return matchSearch && q.is_community;
  if (tab === "my") return matchSearch && q.creator_id === user?.id;
  if (tab === "favorites") return matchSearch && favorites.includes(q.id);
  if (tab === "recent") return matchSearch;

  return true;
});

if (loading) {
  return (
    <div className="flex justify-center items-center h-[60vh]">
      <p className="text-gray-500">Loading quizzes...</p>
    </div>
  );
}

  return (
    <div className="p-6 space-y-6">

      {/* Search */}
      <div className="flex items-center gap-2 w-full px-4 py-2 rounded-2xl
        bg-white/70 dark:bg-slate-800/70 backdrop-blur-md
        border border-gray-200 dark:border-slate-700
        shadow-sm focus-within:ring-2 focus-within:ring-cyan-400 transition-all">
        <SearchOutlined className="text-gray-400 text-lg" />
        <input
          type="text"
          placeholder="Search quizzes..."
          className="bg-transparent outline-none w-full text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 dark:border-slate-700">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`pb-2 text-sm font-medium transition ${
              tab === t.key
                ? "text-cyan-500 border-b-2 border-cyan-500"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {t.label}
            {t.key === "favorites" && favorites.length > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {favorites.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-500 text-white p-6 rounded-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Want to create your own quiz?</h2>
          <p className="text-sm opacity-80">Generate instantly with AI</p>
        </div>
        <div className="flex gap-3">
          <button className="text-white px-4 py-2 rounded-lg font-semibold border border-white hover:bg-white/10 transition">
            AI Generate
          </button>
          <button className="border border-white px-4 py-2 rounded-lg hover:bg-white/10 transition">
            Manual
          </button>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">{tab === "favorites" ? "❤️" : "🔍"}</p>
          <p className="text-gray-500 font-medium">
            {tab === "favorites" ? "No favourites yet" : "No quizzes found"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {tab === "favorites" ? "Click the heart on any quiz to save it here" : "Try a different search"}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((quiz) => (
            <QuizCard
                key={quiz.id}
                quiz={{
                    ...quiz,
                    creator: quiz.creator_name,
                    questionCount: quiz.question_count,
                }}
                isFavorite={favorites.includes(quiz.id)}
                onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}

    </div>
  );
}