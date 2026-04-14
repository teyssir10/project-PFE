import React from 'react'
import { CaretRightOutlined, TeamOutlined, RobotOutlined } from '@ant-design/icons'
import { Card } from 'antd'

const QuickActions = () => {
  return (
    <Card
      className="!rounded-xl !shadow-sm !bg-white dark:!bg-slate-800"
      bodyStyle={{ padding: '12px' }}
    >
      <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
        Quick Actions
      </h2>
      <div className="grid grid-cols-3 gap-2">

        <button className="group p-3 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-500 text-white hover:shadow-md hover:scale-105 transition-all duration-300 flex items-center gap-2">
          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
            <CaretRightOutlined className="text-sm" />
          </div>
          <div className="text-left">
            <p className="font-bold text-xs leading-tight">Start Quiz</p>
            <p className="text-white/80 text-[10px] leading-tight">Jump into a quiz now</p>
          </div>
        </button>

        <button className="group p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 text-white hover:shadow-md hover:scale-105 transition-all duration-300 flex items-center gap-2">
          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
            <TeamOutlined className="text-sm" />
          </div>
          <div className="text-left">
            <p className="font-bold text-xs leading-tight">Play with Friends</p>
            <p className="text-white/80 text-[10px] leading-tight">Challenge your friends</p>
          </div>
        </button>

        <button className="group p-3 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 text-white hover:shadow-md hover:scale-105 transition-all duration-300 flex items-center gap-2">
          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
            <RobotOutlined className="text-sm" />
          </div>
          <div className="text-left">
            <p className="font-bold text-xs leading-tight">Generate AI Quiz</p>
            <p className="text-white/80 text-[10px] leading-tight">Create with AI instantly</p>
          </div>
        </button>

      </div>
    </Card>
  )
}

export default QuickActions