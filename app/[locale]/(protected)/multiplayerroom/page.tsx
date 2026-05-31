'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import { PlusOutlined, LoginOutlined, ThunderboltOutlined, TrophyOutlined, TeamOutlined, LoadingOutlined } from '@ant-design/icons'

export default function MultiplayerPage() {
  const router = useRouter()
  const t = useTranslations('multiplayer')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const joinRoom = async () => {
    if (!code.trim()) return setError(t('join.errorEmpty'))
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data } = await supabase
      .from('rooms')
      .select('id, room_status')   // ✅ status → room_status
      .eq('code', code.toUpperCase())
      .single()

    if (!data) {
      setError(t('join.errorNotFound'))
      setLoading(false)
      return
    }

    // ✅ status → room_status
    if (data.room_status !== 'waiting') {
      setError(t('join.errorStarted'))
      setLoading(false)
      return
    }

    await supabase.from('players').upsert({
      user_id: user.id,
      room_id: data.id,
      is_ready: false,
    }, { onConflict: 'user_id,room_id' })

    router.push(`/lobby/${code.toUpperCase()}`)
  }

  const createRoom = async () => {
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    router.push('/browse-quiz?mode=host')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">

        <div className="text-center space-y-3 mb-12 max-w-xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {t('title.prefix')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-400">
              {t('title.highlight')}
            </span>
          </h1>
          <p className="text-base text-gray-400 dark:text-gray-500 font-medium">
            {t('subtitle')}
          </p>
        </div>

        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6 mb-8">

          <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-gray-200 dark:border-slate-700 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-md transition-all duration-300 group p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center group-hover:bg-cyan-100 dark:group-hover:bg-cyan-800/40 transition-colors flex-shrink-0">
                <LoginOutlined className="text-xl text-cyan-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('join.title')}</h2>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('join.subtitle')}</p>
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-slate-700" />

            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('join.codeLabel')}
              </label>
              <input
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
                onKeyDown={e => e.key === 'Enter' && joinRoom()}
                placeholder={t('join.codePlaceholder')}
                maxLength={8}
                className="w-full border-2 border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 px-4 py-3 rounded-xl text-lg font-mono tracking-[0.2em] uppercase text-center focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-700 transition-all duration-200"
              />
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
            </div>

            <button
              onClick={joinRoom}
              disabled={loading || !code.trim()}
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading
                ? <LoadingOutlined className="text-base animate-spin" />
                : <LoginOutlined className="text-base" />
              }
              {loading ? t('join.connecting') : t('join.button')}
            </button>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-cyan-500 via-cyan-400 to-teal-500 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative p-8 space-y-6">

            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
            <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />

            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors flex-shrink-0">
                <PlusOutlined className="text-xl text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{t('create.title')}</h2>
                <p className="text-sm text-cyan-100 mt-1">{t('create.subtitle')}</p>
              </div>
            </div>

            <div className="h-px bg-white/20 relative z-10" />

            <div className="space-y-4 relative z-10">
              <p className="text-sm text-white/90 leading-relaxed">{t('create.description')}</p>
              <div className="space-y-2">
                {(['chooseQuiz', 'shareCode', 'startGame'] as const).map((key, i) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/20 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm text-white/80">{t(`create.steps.${key}`)}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={createRoom}
              disabled={loading}
              className="w-full bg-white text-cyan-600 hover:bg-cyan-50 py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 relative z-10"
            >
              <PlusOutlined />
              {t('create.button')}
            </button>
          </div>
        </div>

        <div className="w-full max-w-4xl">
          <div className="grid md:grid-cols-3 gap-4 px-4">
            {([
              { icon: <ThunderboltOutlined />, key: 'realTime', color: 'text-cyan-500' },
              { icon: <TeamOutlined />, key: 'maxPlayers', color: 'text-teal-500' },
              { icon: <TrophyOutlined />, key: 'leaderboard', color: 'text-amber-500' },
            ] as const).map(item => (
              <div key={item.key}
                className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
                <span className={`text-lg ${item.color}`}>{item.icon}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t(`stats.${item.key}`)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}