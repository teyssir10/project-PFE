"use client"
import React, { useEffect, useState } from 'react'
import { RiseOutlined, ThunderboltOutlined, TrophyOutlined, GlobalOutlined } from '@ant-design/icons';
import { Card, Spin } from 'antd';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useTranslations } from 'next-intl';

const Stats = () => {
  const t = useTranslations('stats');
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    quizzesPlayed: 0,
    avgScore: 0,
    totalPoints: 0,
    globalRank: 0,
    trend: {
      quizzes: '',
      score: '',
      points: '',
      rank: '',
    }
  });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      setLoading(true);

      const { data: history } = await supabase
        .from('quiz_history')
        .select('score, played_at')
        .eq('user_id', user.id);

      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const thisWeek = history?.filter(h =>
        new Date(h.played_at) > oneWeekAgo
      ) || [];

      const quizzesPlayed = history?.length || 0;
      const totalPoints = history?.reduce((sum, h) => sum + (h.score || 0), 0) || 0;
      const avgScore = quizzesPlayed > 0
        ? Math.round(totalPoints / quizzesPlayed)
        : 0;

      const { data: allUsers } = await supabase
        .from('quiz_history')
        .select('user_id, score');

      const userTotals: Record<string, number> = {};
      allUsers?.forEach(h => {
        userTotals[h.user_id] = (userTotals[h.user_id] || 0) + h.score;
      });

      const sortedUsers = Object.entries(userTotals).sort((a, b) => b[1] - a[1]);
      const rank = sortedUsers.findIndex(([id]) => id === user.id) + 1;
      const weekPoints = thisWeek.reduce((s, h) => s + h.score, 0);

      setStats({
        quizzesPlayed,
        avgScore,
        totalPoints,
        globalRank: rank || 0,
        trend: {
          quizzes: t('thisWeek', { count: thisWeek.length }),
          score: t('avgPercent', { avg: avgScore }),
          points: t('pointsWeek', { points: weekPoints }),
          rank: rank > 0 ? `#${rank}` : t('notRanked'),
        }
      });

      setLoading(false);
    };

    fetchStats();
  }, [user]);

  const statsItems = [
    {
      label: t('quizzesPlayed'),
      value: stats.quizzesPlayed.toString(),
      trend: stats.trend.quizzes,
      icon: <ThunderboltOutlined className="text-base text-cyan-500" />
    },
    {
      label: t('avgScore'),
      value: `${stats.avgScore}%`,
      trend: stats.trend.score,
      icon: <RiseOutlined className="text-base text-teal-500" />
    },
    {
      label: t('totalPoints'),
      value: stats.totalPoints.toLocaleString(),
      trend: stats.trend.points,
      icon: <TrophyOutlined className="text-base text-cyan-600" />
    },
    {
      label: t('globalRank'),
      value: stats.globalRank > 0 ? `#${stats.globalRank}` : '-',
      trend: stats.trend.rank,
      icon: <GlobalOutlined className="text-base text-teal-600" />
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="!rounded-lg !shadow-sm !bg-gradient-to-br !from-[#D6EEF5] !to-cyan-200 dark:!from-slate-800 dark:!to-slate-700">
            <div className="flex justify-center py-2">
              <Spin size="small" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {statsItems.map((stat, i) => (
        <Card
          key={i}
          className="!rounded-lg !shadow-sm
            !bg-gradient-to-br !from-[#D6EEF5] !to-cyan-200
            dark:!from-slate-800 dark:!to-slate-700
            hover:!shadow-md transition-all duration-300"
          bodyStyle={{ padding: '14px 10px' }}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center">
                {stat.icon}
              </div>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white leading-none">
                {stat.value}
              </p>
            </div>
            <div className="w-px h-8 bg-cyan-300/50 dark:bg-slate-500 shrink-0" />
            <div className="flex flex-col min-w-0">
              <p className="text-gray-600 dark:text-gray-400 text-[11px] font-semibold truncate">
                {stat.label}
              </p>
              <div className="flex items-center gap-0.5 mt-1 bg-white/70 dark:bg-slate-600/50 rounded-full px-1.5 py-px w-fit">
                <RiseOutlined className="text-cyan-400" style={{ fontSize: 9 }} />
                <p className="text-[9px] text-cyan-900 dark:text-cyan-300 font-semibold">
                  {stat.trend}
                </p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Stats;