'use client'
import React from 'react'
import Image from 'next/image'
import image from '@/public/contact-us.png'
import { useState } from 'react'

const Contact = () => {
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSend = () => {
    if (email) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    }
  }
  return (
    <>
      
      <section id="contact" className="font-sans px-4 py-16 max-w-5xl mx-auto">
      
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-medium text-gray-900 dark:text-white leading-tight">
          We&apos;re here <span style={{ color: '#00D4D0' }}>to support you.</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-lg mx-auto leading-relaxed">
         Whether you have questions about our features, require technical assistance, or wish to share your feedback, our team is ready to help.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

        {/* Left - Info Cards */}
        <div className="flex flex-col gap-4">
          
          {/* Email Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#00D4D015' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#00D4D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <polyline points="2,4 12,13 22,4"/>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Our team replies within 24h</p>
              <a href="mailto:contact@quizai.com" className="text-xs mt-1 block"
                style={{ color: '#00D4D0' }}>
                contact@quizai.com
              </a>
            </div>
          </div>

          {/* Help Center Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#00D4D015' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#00D4D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Help Center</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Browse our FAQ and documentation</p>
              <a href="#" className="text-xs mt-1 block" style={{ color: '#00D4D0' }}>
                Go to help center →
              </a>
            </div>
          </div>

          {/* Mascot */}
          <div className="mt-4 flex justify-center">
           
             
              <Image src={image} alt="Contact Us" width={1000} height={1000} />
        
          </div>
        </div>

        {/* Right - Form */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-7">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Send us a message
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Full name</label>
              <input type="text" placeholder="Your name"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-cyan-400" />
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Email <span style={{ color: '#00D4D0' }}>*</span>
              </label>
              <input type="email" placeholder="your@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-cyan-400" />
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Subject <span style={{ color: '#00D4D0' }}>*</span>
              </label>
              <select className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-cyan-400">
                <option value="">Select a subject</option>
                <option>General question</option>
                <option>Technical support</option>
                <option>Billing</option>
                <option>Feedback</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Message <span style={{ color: '#00D4D0' }}>*</span>
              </label>
              <textarea placeholder="How can we help you?" rows={5}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-cyan-400 resize-y" />
            </div>

            <button onClick={handleSend}
              className="w-full py-3 rounded-lg text-white text-sm font-medium transition-colors"
              style={{ background: '#111827' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#00D4D0')}
              onMouseLeave={e => (e.currentTarget.style.background = '#111827')}>
              Send message
            </button>

            {success && (
              <p className="text-center text-sm" style={{ color: '#00D4D0' }}>
                ✓ Message sent! We&apos;ll get back to you soon.
              </p>
            )}
          </div>
        </div>
      </div>
      </section>
  
    </>
  )
}
export default Contact
