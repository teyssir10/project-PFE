import React from 'react'
import { BulbOutlined, CheckCircleOutlined, BarChartOutlined, LockOutlined, ShareAltOutlined, StarOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';

const FeaturesSection = () => {
  const t = useTranslations('features');

  const features = [
    { icon: <BulbOutlined />, key: 'ai', color: 'from-[#00D4D0] to-cyan-400' },
    { icon: <CheckCircleOutlined />, key: 'aiValidation', color: 'from-cyan-400 to-blue-400' },
    { icon: <BarChartOutlined />, key: 'analytics', color: 'from-[#00D4D0] to-teal-400' },
    { icon: <LockOutlined />, key: 'secure', color: 'from-cyan-400 to-cyan-400' },
    { icon: <ShareAltOutlined />, key: 'sharing', color: 'from-[#00D4D0] to-blue-400' },
    { icon: <StarOutlined />, key: 'design', color: 'from-cyan-400 to-teal-400' },
  ];

  return (
    <section className="py-20 lg:py-28 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold">{t('title')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-white dark:bg-slate-900 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
              <div className="relative space-y-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} text-white flex items-center justify-center`}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{t(`${feature.key}.title`)}</h3>
                  <p className="text-muted-foreground mt-2">{t(`${feature.key}.description`)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;