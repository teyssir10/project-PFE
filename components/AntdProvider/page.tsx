'use client'

import { ConfigProvider, theme } from 'antd'
import { useTheme } from 'next-themes'
import { useLocale } from 'next-intl'
import ar_EG from 'antd/locale/ar_EG'
import fr_FR from 'antd/locale/fr_FR'
import en_US from 'antd/locale/en_US'

export function AntdProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()
  const locale = useLocale()

  const antdLocale = locale === 'ar' ? ar_EG : locale === 'fr' ? fr_FR : en_US

  return (
    <ConfigProvider
      direction={locale === 'ar' ? 'rtl' : 'ltr'}
      locale={antdLocale}
      theme={{
        algorithm: resolvedTheme === 'dark'
          ? theme.darkAlgorithm
          : theme.defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  )
}