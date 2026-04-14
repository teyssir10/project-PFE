import React from 'react'
import { Button } from 'antd'
import { SunOutlined, MoonOutlined } from '@ant-design/icons'
import { useTheme } from "next-themes";


const LightToDark = () => {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <div>
          <Button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="rounded-full w-10 h-10 flex items-center justify-center transition hover:scale-110">
            {resolvedTheme === "dark"
                ? <SunOutlined className="text-yellow-400 text-lg" />
                : <MoonOutlined className="text-gray-700 text-lg" />
            }
        </Button>
    </div>)
}

export default LightToDark