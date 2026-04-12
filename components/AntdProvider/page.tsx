'use client'

import { ConfigProvider, theme } from 'antd'
import { useTheme } from 'next-themes'

export function AntdProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()

  return (
    <ConfigProvider
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