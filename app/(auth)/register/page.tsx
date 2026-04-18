'use client'

import { useState } from 'react'
import Image from 'next/image'
import * as yup from 'yup'
import { useAntdApp } from '@/lib/useAntdApp'

import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Divider, Form, Input } from 'antd'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { SunOutlined, MoonOutlined } from '@ant-design/icons'
import logo from '@/public/panda-logo.png'

const registerSchema = yup.object({
  email: yup.string().required('Please enter your email').email('Please enter a valid email address'),
  password: yup.string().required('Please enter your password').min(6, 'Password must be at least 6 characters'),
  firstName: yup.string().required('Please enter your first name'),
  lastName: yup.string().required('Please enter your last name'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
})

const RegisterPage = () => {
  const { message } = useAntdApp()
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { signUp, signInWithGoogle } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(registerSchema),
  })

  const onSubmit = async (values: any) => {
    setLoading(true)
    try {
      const { error } = await signUp(values.email, values.password)
      if (error) {
        message.error(error.message)
      } else {
        setEmailSent(true)
      }
    } catch (error: unknown) {
      message.error((error as { message: string }).message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle()
    if (error) {
      message.error(error.message)
    }
  }

  return (
    <div className="w-full min-h-screen relative overflow-hidden bg-white dark:bg-gray-950 transition-colors duration-300">

      {/* Bouton dark mode */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="fixed top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        aria-label="Toggle dark mode"
      >
        {theme === 'dark'
          ? <SunOutlined className="text-amber-400 text-base" />
          : <MoonOutlined className="text-gray-600 text-base" />
        }
      </button>

      <div className="relative z-10 flex items-center justify-center h-screen overflow-hidden px-6">
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center mx-auto">

          {/* LEFT SIDE */}
          <div className="hidden md:flex flex-col justify-center space-y-12 relative sticky top-0 h-screen">
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-cyan-400/30 dark:bg-cyan-500/10 blur-3xl rounded-full" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#00D4D0]/30 dark:bg-[#00D4D0]/10 blur-3xl rounded-full" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500 to-[#00D4D0] shadow-xl shadow-cyan-500/30">
                  <span className="text-4xl">
                    <Image src={logo} alt="PandoMind AI logo" />
                  </span>
                </div>
                <div>
                  <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    PandoMind <span className="text-cyan-500">AI</span>
                  </h1>
                  <span className="text-sm font-semibold px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400">
                    AI Powered
                  </span>
                </div>
              </div>
              <p className="text-xl text-gray-500 dark:text-gray-400 max-w-md leading-relaxed">
                Create intelligent quizzes in seconds using AI and track your learning journey with powerful analytics.
              </p>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex gap-5 items-start p-5 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg shadow-md hover:shadow-xl transition">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-cyan-500/20 dark:bg-cyan-500/10 text-xl">⚡</div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Lightning Fast</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Generate quizzes instantly with advanced AI technology.</p>
                </div>
              </div>
              <div className="flex gap-5 items-start p-5 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg shadow-md hover:shadow-xl transition">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#00D4D0]/20 dark:bg-[#00D4D0]/10 text-xl">🎯</div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Smart Learning</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Adaptive quizzes tailored to every learner level.</p>
                </div>
              </div>
              <div className="flex gap-5 items-start p-5 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg shadow-md hover:shadow-xl transition">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-cyan-500/20 dark:bg-cyan-500/10 text-xl">📊</div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Advanced Analytics</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Track progress and improve your knowledge effectively.</p>
                </div>
              </div>
            </div>
          </div>

          {/* REGISTER CARD */}
          <div
            className="w-full max-w-md px-4 overflow-y-auto h-screen py-10"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
          >
            <div className="text-center mb-6 mt-6">
              <div className="w-14 h-14 bg-[#00D4D0] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-400/40">
                <LockOutlined className="text-white text-2xl" />
              </div>
              <Title level={1} className="!text-slate-800 dark:!text-white mb-1">Create an Account ✍️</Title>
              <Text className="text-slate-500 dark:!text-gray-400">Sign up to create and take quizzes</Text>
            </div>

            {emailSent ? (

              <Card className="!border !border-slate-200 dark:!border-gray-700 !shadow-lg shadow-cyan-400/30 !rounded-xl dark:!bg-gray-900">
                <div className="flex flex-col items-center text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900/40 rounded-full flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                      stroke="#00D4D0" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <Title level={3} className="!text-slate-800 dark:!text-white !mb-0">Compte créé avec succès !</Title>
                  <Text className="text-slate-500 dark:!text-gray-400 text-base">
                    Vérifiez votre email pour confirmer votre compte avant de vous connecter.
                  </Text>
                  <div className="flex items-center gap-2 bg-cyan-50 dark:bg-cyan-900/30 px-4 py-2 rounded-lg mt-2">
                    <MailOutlined className="text-cyan-500" />
                    <Text className="text-cyan-600 dark:!text-cyan-400 text-sm">Email de confirmation envoyé</Text>
                  </div>
                  <Button
                    type="link"
                    className="!text-[#00D4D0] font-semibold mt-4"
                    onClick={() => router.push('/login')}
                  >
                    Aller à la page de connexion →
                  </Button>
                </div>
              </Card>

            ) : (

              <Card className="!border !border-slate-200 dark:!border-gray-700 !shadow-lg shadow-cyan-400/30 !rounded-xl dark:!bg-gray-900">
                <Form autoComplete="off" layout="vertical" className="space-y-2" onFinish={handleSubmit(onSubmit)}>

                  <div className="flex gap-3">
                    <Form.Item
                      label={<span className="dark:text-gray-300">Prénom</span>}
                      className="flex-1"
                      validateStatus={errors.firstName ? 'error' : undefined}
                      help={errors.firstName?.message}
                    >
                      <Controller
                        name="firstName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            prefix={<UserOutlined className="text-slate-400" />}
                            size="large"
                            className="rounded-lg h-[56px] text-sm border-gray-200 dark:!border-gray-600 dark:!bg-gray-800 dark:!text-white focus:border-cyan-500 transition-all"
                            placeholder="Prénom"
                          />
                        )}
                      />
                    </Form.Item>
                    <Form.Item
                      label={<span className="dark:text-gray-300">Nom</span>}
                      className="flex-1"
                      validateStatus={errors.lastName ? 'error' : undefined}
                      help={errors.lastName?.message}
                    >
                      <Controller
                        name="lastName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            prefix={<UserOutlined className="text-slate-400" />}
                            size="large"
                            className="rounded-lg h-[56px] text-sm border-gray-200 dark:!border-gray-600 dark:!bg-gray-800 dark:!text-white focus:border-cyan-500 transition-all"
                            placeholder="Nom"
                          />
                        )}
                      />
                    </Form.Item>
                  </div>

                  <Form.Item
                    label={<span className="dark:text-gray-300">Email</span>}
                    validateStatus={errors.email ? 'error' : undefined}
                    help={errors.email?.message}
                  >
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          autoComplete="new-password"
                          prefix={<MailOutlined className="text-slate-400" />}
                          size="large"
                          className="rounded-lg h-[56px] text-sm border-gray-200 dark:!border-gray-600 dark:!bg-gray-800 dark:!text-white focus:border-cyan-500 transition-all"
                          placeholder="you@example.com"
                        />
                      )}
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="dark:text-gray-300">Password</span>}
                    validateStatus={errors.password ? 'error' : undefined}
                    help={errors.password?.message}
                  >
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <Input.Password
                          autoComplete="new-password"
                          {...field}
                          prefix={<LockOutlined className="text-slate-400" />}
                          size="large"
                          className="rounded-lg h-[56px] text-sm border-gray-200 dark:!border-gray-600 dark:!bg-gray-800 dark:!text-white focus:border-cyan-500 transition-all"
                          placeholder="••••••••"
                        />
                      )}
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="dark:text-gray-300">Confirm Password</span>}
                    validateStatus={errors.confirmPassword ? 'error' : undefined}
                    help={errors.confirmPassword?.message}
                  >
                    <Controller
                      name="confirmPassword"
                      control={control}
                      render={({ field }) => (
                        <Input.Password
                          {...field}
                          prefix={<LockOutlined className="text-slate-400" />}
                          size="large"
                          className="rounded-lg h-[56px] text-sm border-gray-200 dark:!border-gray-600 dark:!bg-gray-800 dark:!text-white focus:border-cyan-500 transition-all"
                          placeholder="••••••••"
                        />
                      )}
                    />
                  </Form.Item>

                  <Button
                    onClick={handleGoogleLogin}
                    size="large"
                    block
                    className="!h-[58px] !rounded-[16px] font-bold text-[16px] border !border-slate-200 dark:!border-gray-600 dark:!bg-gray-800 dark:!text-[#00D4D0] !hover:border-cyan-400 !hover:scale-[1.03] !transition-all !duration-300 mb-3 !text-[#00D4D0]"
                  >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="google" className="w-5 h-5 inline mr-2" />
                    Continue with Google
                  </Button>

                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    block
                    className="h-[58px] rounded-[16px] font-bold text-[16px] !bg-gradient-to-r !from-cyan-500 !to-[#00D4D0] border-0 shadow-[0_10px_30px_rgba(6,182,212,0.4)] tracking-[0.02em] hover:scale-[1.03] transition-all duration-300"
                  >
                    Sign Up
                  </Button>
                </Form>

                <Divider plain className="!text-gray-400 dark:!text-gray-600 dark:before:!border-gray-700 dark:after:!border-gray-700">Or</Divider>

                <Button
                  className="h-[58px] rounded-[16px] font-bold text-[16px] !bg-gradient-to-r !from-cyan-500 !to-[#00D4D0] border-0 shadow-[0_10px_30px_rgba(6,182,212,0.4)] !text-white tracking-[0.02em] hover:scale-[1.03] transition-all duration-300"
                  type="link"
                  block
                  onClick={() => router.push('/login')}
                >
                  Already have an account? Sign In
                </Button>
              </Card>

            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default RegisterPage