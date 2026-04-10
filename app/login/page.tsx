'use client'

import { useState,useEffect } from 'react'
import Image from 'next/image'
import * as yup from 'yup'
import { useAntdApp } from '../../lib/useAntdApp'
import Deco from '../components/Decoration/Deco'
import { MailOutlined , LockOutlined,UserOutlined} from '@ant-design/icons'
import { Button, Card, Divider, Form, Input } from 'antd'
import Text from 'antd/es/typography/Text';
import Title from 'antd/es/typography/Title'
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '@/lib/auth';
import { useRouter } from "next/navigation";
import logo from '@/app/assets/panda-logo.png';
import { useSearchParams } from 'next/navigation'




const loginSchema = yup.object({
  email:yup.string().required("Please enter your email").email("Please enter a valid email address"),
  password:yup.string().required("Please enter your password").min(6,"Password must be at least 6 characters"),
  firstName:yup.string().when('isSignUp',{
    is:true,
    then:(s)=>s.required("Please enter your first name"),
    otherwise:(s)=>s.optional()
  }),
  lastName:yup.string().when('isSignUp',{
    is:true,
    then:(s)=>s.required("Please enter your last name"),
    otherwise:(s)=>s.optional()
  }),
  confirmPassword:yup.string().when('isSignUp',{
    is:true,
    then:(s)=>s.oneOf([yup.ref('password')], "Passwords must match").required("Please confirm your password"),
    otherwise:(s)=>s.optional()
  })

})


const Page = () => {
  const{message}=useAntdApp()
    const searchParams = useSearchParams()
  const [isSignUp, setIsSignUp]=useState(false)
  useEffect(() => {
  const mode = searchParams.get("mode")
  if (mode === "signup") {
    setIsSignUp(true)
  } else {
    setIsSignUp(false)
  }
}, [searchParams])
  const [loading, setLoading]=useState(false)
  
  const {signIn,signUp,signInWithGoogle}=useAuth()
  const router=useRouter()

  const {control,handleSubmit,formState:{errors}}=useForm({resolver:yupResolver(loginSchema)})
      const onSubmit=async(values:any)=>{
        console.log('onSubmit:')
        setLoading(true)
        try{
          if(isSignUp){
            const{error}=await signUp(values.email,values.password)
            if(error){
              message.error(error.message)
            }else{
              message.success("Account created successfully! Please check your email to confirm your account.")
              setIsSignUp(false)
            }

        }else{
          const{error}=await signIn(values.email,values.password)
          if(error){
            message.error(error.message)
          }else{
            message.success("Logged in successfully!")
            router.push('/dashboard')
          }
        }
      }catch(error: unknown){
        message.error((error as { message: string }).message || "An error occurred. Please try again.")
      }finally{
        setLoading(false)
      }
    }
  
    const handleGoogleLogin=async()=>{
      const{error}=await signInWithGoogle()
      if(error){
        message.error(error.message)
      }
    }

  return (
    <div className="w-full min-h-screen relative overflow-hidden">
      <Deco />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* LEFT SIDE */}
          {/* LEFT SIDE */}
<div className="hidden md:flex flex-col justify-center space-y-12 relative">

  {/* Glow background */}
  <div className="absolute -top-20 -left-20 w-72 h-72 bg-cyan-400/30 blur-3xl rounded-full"></div>
  <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#00D4D0]/30 blur-3xl rounded-full"></div>

  {/* Logo + Title */}
  <div className="relative z-10">

    <div className="flex items-center gap-4 mb-8">

      <div className="flex items-center justify-center 
      w-20 h-20 rounded-3xl 
      bg-gradient-to-br from-cyan-500 to-[#00D4D0] 
      shadow-xl shadow-cyan-500/30">

        <span className="text-4xl"><Image src={logo} alt="PandoMind AI logo" /></span>

      </div>

      <div>

        <h1 className="text-6xl font-extrabold text-gray-900  dark:text-white tracking-tight">
          
          PandoMind  <span className="text-cyan-500">AI</span>
        </h1>
      

        <span className="text-sm font-semibold px-3 py-1 rounded-full bg-cyan-100 text-cyan-600">
          AI Powered
        </span>

      </div>

    </div>

    <p className="text-xl text-gray-500 max-w-md leading-relaxed">
      Create intelligent quizzes in seconds using AI and track your learning journey with powerful analytics.
    </p>

  </div>


  {/* Features */}
  <div className="space-y-6 relative z-10">

    {/* Feature 1 */}
    <div className="flex gap-5 items-start p-5 rounded-2xl 
    bg-white/70 backdrop-blur-lg shadow-md hover:shadow-xl 
    transition">

      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-cyan-500/20 text-xl">
        ⚡
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 text-lg">
          Lightning Fast
        </h3>

        <p className="text-gray-500 text-sm">
          Generate quizzes instantly with advanced AI technology.
        </p>
      </div>

    </div>


    {/* Feature 2 */}
    <div className="flex gap-5 items-start p-5 rounded-2xl 
    bg-white/70 backdrop-blur-lg shadow-md hover:shadow-xl 
    transition">

      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#00D4D0]/20 text-xl">
        🎯
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 text-lg">
          Smart Learning
        </h3>

        <p className="text-gray-500 text-sm">
          Adaptive quizzes tailored to every learner level.
        </p>
      </div>

    </div>


    {/* Feature 3 */}
    <div className="flex gap-5 items-start p-5 rounded-2xl 
    bg-white/70 backdrop-blur-lg shadow-md hover:shadow-xl 
    transition">

      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-cyan-500/20 text-xl">
        📊
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 text-lg">
          Advanced Analytics
        </h3>

        <p className="text-gray-500 text-sm">
          Track progress and improve your knowledge effectively.
        </p>
      </div>

    </div>

  </div>

</div>
          {/* LOGIN CARD */}
<div className='w-full max-w-md px-4'>
  <div className='text-center mb-6 mt-6'>
    <div className='w-14 h-14 bg-[#00D4D0] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-400/40'>
<LockOutlined className='text-white text-2xl' />
      
    </div>
    <Title level={1} className='text-slate-800 mb-1'>{isSignUp ? 'Create an Account ✍️' : 'Welcome Back  👋'}</Title>
    <Text className='text-slate-500'>{isSignUp?  "Sign up to create and take quizzes " : "Sign in to access your quizzes"}</Text>
  </div>

          <Card
            className="border border-slate-200 shadow-lg shadow-cyan-400/30 rounded-xl"
          >
          <Form  autoComplete="off" layout="vertical" className="space-y-2" onFinish={handleSubmit(onSubmit)}>
            {isSignUp && (
              <div className='flex gap-3'>
              <Form.Item
              label='Prénom'
               className='flex-1'
              validateStatus={errors.firstName ? "error" : undefined}
              help={errors.firstName?.message}>

                  <Controller
                  name="firstName"
                  control={control}
                  render={({field})=>(
                    <Input
                    {...field}
                    prefix={<UserOutlined className='text-slate-400'/>}
                    size='large'
                    className='rounded-lg h-[56px]  text-sm border-gray-200 focus:border-cyan-500 transition-all'
                    placeholder='Prénom'/>
                  )}/>
                  </Form.Item>
                    <Form.Item
              label='Nom'
                className='flex-1'
              validateStatus={errors.lastName ? "error" : undefined}
              help={errors.lastName?.message}>
                  <Controller
                  name="lastName"
                  control={control}
                  render={({field})=>(
                    <Input
                    {...field}
                    prefix={<UserOutlined className='text-slate-400'/>}
                    size='large'
                    className='rounded-lg h-[56px]  text-sm border-gray-200 focus:border-cyan-500 transition-all'
                    placeholder='Nom'/>
                  )}/>
              </Form.Item>
              </div>
            )}

              <Form.Item
              label='Email'
              validateStatus={errors.email ? "error" : undefined}
              help={errors.email?.message}>
                  <Controller
                  name="email"
                  control={control}
                  render={({field})=>(
                    <Input
                    {...field}
                    autoComplete="new-password" 
                    prefix={<MailOutlined className='text-slate-400'/>}
                    size='large'
                    className='rounded-lg h-[56px]  text-sm border-gray-200 
                  focus:border-cyan-500 transition-all'
                    placeholder='you@example.com'/>
                  )}/>
                  </Form.Item>
              <Form.Item
              label='Password'
              validateStatus={errors.password ? "error" : undefined}
              help={errors.password?.message}>
                  <Controller
                  name="password"
                  control={control}
                  render={({field})=>(
                      <Input.Password
                      autoComplete="new-password" 
                      {...field}
                      prefix={<LockOutlined className='text-slate-400'/>}
                      size='large'
                      className='rounded-lg h-[56px] text-sm border-gray-200 
                  focus:border-cyan-500 transition-all'
                      placeholder="••••••••"/>
                  )}
                  />
                  </Form.Item>
                  {isSignUp && (
                    <Form.Item
                    label='Confirm Password'
                    validateStatus={errors.confirmPassword ? "error" : undefined}
                      help={errors.confirmPassword?.message}>
                      <Controller
                      name="confirmPassword"
                      control={control}
                      render={({field})=>(
                        <Input.Password
                        {...field}
                        prefix={<LockOutlined className='text-slate-400'/>}
                        size='large'
                        className='rounded-lg h-[56px] text-sm border-gray-200
                    focus:border-cyan-500 transition-all'
                        placeholder="••••••••"/>
                      )}/>
                      </Form.Item>


                   ) }
                   {isSignUp && (
                       <Button
                 onClick={handleGoogleLogin}
                 size='large'
                 block
                  className="!h-[58px] !rounded-[16px] font-bold text-[16px] border !border-slate-200
        !hover:border-cyan-400 !hover:scale-[1.03] !transition-all !duration-300 mb-3 !text-[#00D4D0]">
          <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="google"
        className="w-5 h-5 inline mr-2 " />
      Continue with Google

          </Button>)}
                   <Button
                   type='primary'
                    htmlType='submit'
                    size='large'
                    loading={loading}
                    block
                     className="h-[58px] rounded-[16px] font-bold text-[16px]
                  !bg-gradient-to-r !from-cyan-500 !to-[#00D4D0] border-0
                  shadow-[0_10px_30px_rgba(6,182,212,0.4)]
                  tracking-[0.02em] hover:scale-[1.03] transition-all duration-300">
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                  </Button>
                  </Form>
                 <Divider plain className='text-gray-400'>Or</Divider>
              
                  <Button  className="h-[58px] rounded-[16px] font-bold text-[16px]
                  !bg-gradient-to-r !from-cyan-500 !to-[#00D4D0] border-0
                  shadow-[0_10px_30px_rgba(6,182,212,0.4)] !text-white
                  tracking-[0.02em] hover:scale-[1.03] transition-all duration-300" type='link' block onClick={()=>{if(isSignUp){router.push('/login'); setIsSignUp(false)}else{router.push('/login?mode=signup'); setIsSignUp(true)}}}>
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                  </Button>
                  <Text className="text-gray-500 text-sm block text-center mt-4">
              Demo account:
               <br />
                Email: demo@pandabrain.ai  
               Password: 123456
             </Text>
          </Card>
        </div>

        </div>
      </div>
    </div>
     
    
  )
}

export default Page