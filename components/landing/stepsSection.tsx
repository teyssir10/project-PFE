'use client'
import React from 'react'
import { CheckCircleOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';

const StepsSection = () => {
  const t = useTranslations('steps');

  const steps = [
    { number: 1, key: 'step1' },
    { number: 2, key: 'step2' },
    { number: 3, key: 'step3' },
  ];

  return (
    <section className='bg-gradient-to-b from-gray-50 to-white dark:from-slate-950 dark:to-slate-900 py-20 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4'>
            {t('title')}
          </h2>
          <p className='text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto'>
            {t('subtitle')}
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 relative'>
          <div className='hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent'></div>
          {steps.map((step) => (
            <div key={step.number} className='relative'>
              <div className='bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 h-full flex flex-col relative z-10 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 cursor-pointer'>
                <div className='w-14 h-14 rounded-full bg-gradient-to-r from-[#00D4D0] to-cyan-500 flex items-center justify-center text-white font-bold text-xl mb-6 -mt-20 mx-auto'>
                  {step.number}
                </div>
                <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-4 text-center'>
                  {t(`${step.key}.title`)}
                </h3>
                <p className='text-gray-600 dark:text-gray-400 text-base leading-relaxed flex-grow text-center mb-6'>
                  {t(`${step.key}.description`)}
                </p>
                <div className='flex justify-center'>
                  <CheckCircleOutlined className='!text-3xl !text-green-500' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StepsSection;