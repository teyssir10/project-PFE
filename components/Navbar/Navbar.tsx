"use client";
import { Button, Menu } from 'antd';
import {
  MenuUnfoldOutlined, MenuFoldOutlined,
  LoginOutlined, UserAddOutlined,
  LogoutOutlined, SunOutlined, MoonOutlined
} from '@ant-design/icons';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import logo from '@/app/assets/panda-logo.png';
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth"; // 👈 adapte le chemin

const menuItems = [
  { key: 'home',        label: <Link href="/">Home</Link> },
  { key: 'about',       label: <Link href="/about">About</Link> },
  { key: 'quiz',        label: <Link href="/quiz">Quiz</Link> },
  { key: 'leaderboard', label: <Link href="/leaderboard">Leaderboard</Link> },
  { key: 'contact',     label: <Link href="/contact">Contact</Link> },
];

const Navbar = () => {
  const [mounted, setMounted]       = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { user, signOut }           = useAuth(); // 👈 lit l'état auth

  useEffect(() => { setMounted(true); }, []);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-gray-200/60 dark:border-gray-800 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer transition-transform duration-200 hover:scale-105">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl font-extrabold shadow-md">
              <Image src={logo} alt="PandaBrain AI logo" width={100} height={100} />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              PandoMind <span className="text-cyan-500">AI</span>
            </h1>
          </div>

          {/* Menu links */}
          <div className="hidden md:flex items-center">
            <Menu
              mode="horizontal"
              items={menuItems}
              className="bg-transparent border-none text-sm font-medium text-gray-700 dark:text-white tracking-tight hover:text-cyan-500 transition-colors duration-200 [&_.ant-menu-item]:px-3"
              style={{ background: 'transparent' }}
            />
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
             {mounted && (
                  <Button
                    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                    className="rounded-full w-10 h-10 flex items-center justify-center transition hover:scale-110"
                  >
                    {resolvedTheme === "dark"
                      ? <SunOutlined className="text-yellow-400 text-lg" />
                      : <MoonOutlined className="text-gray-700 text-lg" />
                    }
                  </Button>
                )}
            {user ? (
              // ✅ Connecté → Logout
              <Button
                icon={<LogoutOutlined />}
                onClick={signOut}
                className="px-6 py-2 rounded-full font-semibold !text-white
                  !bg-gradient-to-r !from-cyan-500 !via-cyan-400 !to-[#00D4D0]
                  !border-0 shadow-md hover:shadow-lg hover:scale-105
                  transition-all duration-300 shadow-cyan-300/50"
              >
                Logout
              </Button>
            ) : (
              // ✅ Non connecté → dark toggle + Login + Sign Up
              <>
             

                <Link href="/login">
                  <Button
                    icon={<LoginOutlined />}
                    type="text"
                    className="px-6 py-2 rounded-full font-semibold !text-cyan-500
                      bg-gradient-to-r from-cyan-500 via-cyan-400 to-sky-500 shadow-md
                      hover:shadow-lg hover:scale-105 transition-all duration-300
                      shadow-cyan-400/40 hover:shadow-cyan-500/60"
                  >
                    Login
                  </Button>
                </Link>

                <Link href="/register">
                  <Button
                    icon={<UserAddOutlined />}
                    type="primary"
                    className="px-6 py-2 rounded-full font-semibold
                      !bg-gradient-to-r !from-cyan-500 !to-[#00D4D0]
                      !border-0 text-white shadow-md
                      hover:shadow-lg hover:scale-105 transition-all duration-300
                      shadow-cyan-300/50 hover:shadow-cyan-400/70"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Burger mobile */}
          <button className="md:hidden text-2xl" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <Menu
              mode="vertical"
              items={menuItems}
              className="bg-transparent border-0"
              style={{ background: 'transparent' }}
            />
            <div className="flex flex-col gap-2 mt-4">
              {user ? (
                <Button
                  block
                  icon={<LogoutOutlined />}
                  onClick={signOut}
                  className="rounded-full font-semibold !text-white
                    !bg-gradient-to-r !from-cyan-500 !to-[#00D4D0]
                    !border-0 shadow-md"
                >
                  Logout
                </Button>
              ) : (
                <>
                  <Link href="/login">
                    <Button block type="text"
                      className="rounded-full font-semibold !text-cyan-500
                        bg-gradient-to-r from-cyan-500 via-cyan-400 to-sky-500 shadow-md"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button block type="primary"
                      className="rounded-full font-semibold
                        !bg-gradient-to-r !from-blue-400 !to-cyan-500
                        !border-0 text-white shadow-md"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;