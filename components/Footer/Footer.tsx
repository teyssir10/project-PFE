import React from 'react'
import { FacebookOutlined, TwitterOutlined, LinkedinOutlined, InstagramOutlined } from '@ant-design/icons';
const Footer:React.FC = () => {
    const currentYear = new Date().getFullYear();
    const footerSections=[
        {
            title:'Company',
            links:[
                {label:'About Us', href:'/about'},
                {label:'Careers', href:'/careers'},
                {label:'Blog', href:'/blog'},
            ]
            },
        {
            title:'Support',
            links:[
                {label:'Help Center', href:'/help'},
                {label:'Contact Us', href:'/contact'},
                {label:'Privacy Policy', href:'/privacy'},
            ]
        }
        
    ]
  return (
    <footer className='border-t border-border bg-muted/50 py-12 sm:py-16 lg:py-20 bg-[#00D4D0]/10'>
     <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>  
     <div className='grid grid-cols-1 md:grid-cols-5 gap-8'>
                <div className='col-span-1'>
                    <h3 className='text-2xl font-bold bg-gradient-to-r from-cyan-500 to-[#00D4D0] bg-clip-text text-transparent mb-4'>
                  PandoMind AI
                    </h3>
                    <p className='text-gray-400 text-sm leading-relaxed mb-6'>
                        Empowering learners worldwide with AI-powered personalized education.
                    </p>
                      <div className='flex gap-4'>
                        <a href="#" className='text-gray-400 hover:text-cyan-500 transition-colors'>
                            <FacebookOutlined className='text-xl'/>
                        </a>
                        <a href="#" className='text-gray-400 hover:text-cyan-500 transition-colors'>
                            <TwitterOutlined className='text-xl'/>
                        </a>
                        <a href="#" className='text-gray-400 hover:text-cyan-500 transition-colors'>
                            <LinkedinOutlined className='text-xl'/>
                        </a>
                        <a href="#" className='text-gray-400 hover:text-cyan-500 transition-colors'>
                            <InstagramOutlined className='text-xl'/>
                        </a>
                    </div>
                </div>
                 {footerSections.map((section)=>(
                    <div key={section.title} className='col-span-1'>
                        <h4 className='text-black font-semibold text-base mb-4'>
                            {section.title}
                        </h4>
                        <ul className='space-y-3'>
                            {section.links.map((link)=>(
                                <li key={link.label}>
                                    <a href={link.href} className='text-gray-400 hover:text-cyan-500 transition-colors text-sm'>
                                        {link.label}
                                    </a>
                                </li>))}
                        </ul>
        
              
            </div>))}
                    </div>
                     <div className='border-t border-gray-800 my-12'></div>
                <div className='flex flex-col md:flex-row justify-between items-center'>
                    <p className='text-gray-500 text-sm text-center md:text-left'>
                       © {currentYear} QuizMaster. All rights reserved. Designed with care for learners worldwide.
                    </p>
                </div>
        
      </div>
    </footer>
  )
}

export default Footer
