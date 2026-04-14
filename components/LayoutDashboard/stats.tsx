import React from 'react'
import { RiseOutlined, ThunderboltOutlined, TrophyOutlined, GlobalOutlined } from '@ant-design/icons';
import { Card } from 'antd';

const statsitems = [
  { label: 'Quizzes Played', value: '24', trend: '+3 this week', icon: <ThunderboltOutlined className="text-base text-cyan-500" /> },
  { label: 'Avg. Score', value: '85%', trend: '+5% vs last week', icon: <RiseOutlined className="text-base text-teal-500" /> },
  { label: 'Total Points', value: '1,240', trend: '+120 today', icon: <TrophyOutlined className="text-base text-cyan-600" /> },
  { label: 'Global Rank', value: '#42', trend: '↑ 8 positions', icon: <GlobalOutlined className="text-base text-teal-600" /> },
]

const Stats = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {statsitems.map((stat, i) => (
        <Card
  key={i}
  className="!rounded-lg !shadow-sm 
    !bg-gradient-to-br !from-[#D6EEF5] !to-cyan-200 
    dark:!from-slate-800 dark:!to-slate-700
    hover:!shadow-md transition-all duration-300"
  bodyStyle={{ padding: '14px 10px' }}
>
  <div className="flex items-center gap-2">
    {/* GAUCHE : icône + valeur */}
    <div className="flex items-center gap-2 shrink-0">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center">
        {stat.icon}
      </div>
      <p className="text-xl font-extrabold text-gray-900 dark:text-white leading-none">{stat.value}</p>
    </div>

    {/* DIVIDER */}
    <div className="w-px h-8 bg-cyan-300/50 dark:bg-slate-500 shrink-0" />

    {/* DROITE : label + trend */}
    <div className="flex flex-col min-w-0">
      <p className="text-gray-600 dark:text-gray-400 text-[11px] font-semibold truncate">{stat.label}</p>
      <div className="flex items-center gap-0.5 mt-1 bg-white/70 dark:bg-slate-600/50 rounded-full px-1.5 py-px w-fit">
        <RiseOutlined className="text-cyan-400" style={{ fontSize: 9 }} />
        <p className="text-[9px] text-cyan-900 dark:text-cyan-300 font-semibold">{stat.trend}</p>
      </div>
    </div>
  </div>
</Card>
      ))}
    </div>
  )
}

export default Stats