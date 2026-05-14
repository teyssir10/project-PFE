"use client";
import { Button, Menu } from 'antd';
import {
  MenuUnfoldOutlined, MenuFoldOutlined,
  LoginOutlined, UserAddOutlined,
  LogoutOutlined, FileSearchOutlined
} from '@ant-design/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import logo from '@/public/panda-logo.png';
import { useAuth } from "@/lib/auth";
import LightToDark from '../UI/Button/LightToDark';
import LanguageSwitcher from "@/components/LanguageSwitcher/LanguageSwitcher";
import { useTranslations } from 'next-intl';

const Navbar = () => {
  const t = useTranslations('navbar');
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const menuItems = [
    { key: "home", label: <span onClick={() => scrollTo("home")}>{t('home')}</span> },
    { key: "features", label: <span onClick={() => scrollTo("features")}>{t('features')}</span> },
    { key: "steps", label: <span onClick={() => scrollTo("steps")}>{t('howItWorks')}</span> },
    { key: "categories", label: <span onClick={() => scrollTo("categories")}>{t('categories')}</span> },
    { key: "leaderboard", label: <span onClick={() => scrollTo("leaderboard")}>{t('leaderboard')}</span> },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-gray-200/60 dark:border-gray-800 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-16">

          {/* LOGO */}
          <div className="flex items-center gap-3 cursor-pointer transition-transform duration-200 hover:scale-105">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl font-extrabold shadow-md">
              <Image src={logo} alt="PandaBrain AI logo" width={100} height={100} />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              PandoMind <span className="text-cyan-500">AI</span>
            </h1>
          </div>

          {/* MENU DESKTOP */}
          <div className="hidden md:flex items-center">
            <Menu
              mode="horizontal"
              items={menuItems}
              onClick={(e) => scrollTo(e.key)}
              className="bg-transparent border-none !text-sm font-medium text-gray-700 dark:text-white tracking-tight [&_.ant-menu-item]:px-3"
              style={{ background: 'transparent' }}
            />
          </div>

          {/* RIGHT ACTIONS */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            {mounted && <LightToDark />}
            {user ? (
              <>
                <Button
                  icon={<LogoutOutlined />}
                  onClick={signOut}
                  className="px-6 py-2 rounded-full font-semibold !text-white
                    !bg-gradient-to-r !from-cyan-500 !via-cyan-400 !to-[#00D4D0]
                    !border-0 shadow-md hover:shadow-lg hover:scale-105
                    transition-all duration-300 shadow-cyan-300/50"
                >
                  {t('logout')}
                </Button>
                <Button
                  icon={<FileSearchOutlined />}
                  onClick={() => router.push("/dashboard")}
                  className="px-6 py-2 rounded-full font-semibold !text-cyan-500
                    shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  {t('dashboard')}
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    icon={<LoginOutlined />}
                    type="text"
                    className="px-6 py-2 rounded-full font-semibold !text-cyan-500 shadow-md"
                  >
                    {t('login')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    icon={<UserAddOutlined />}
                    type="primary"
                    className="px-6 py-2 rounded-full font-semibold
                      !bg-gradient-to-r !from-cyan-500 !to-[#00D4D0]
                      !border-0 text-white shadow-md"
                  >
                    {t('register')}
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
                <Button block icon={<LogoutOutlined />} onClick={signOut}
                  className="rounded-full font-semibold !text-white
                    !bg-gradient-to-r !from-cyan-500 !to-[#00D4D0] !border-0 shadow-md">
                  {t('logout')}
                </Button>
              ) : (
                <>
                  <Link href="/login">
                    <Button block type="text"
                      className="rounded-full font-semibold !text-cyan-500 shadow-md">
                      {t('login')}
                    </Button>
                  </Link>
                  <Button
                    icon={<FileSearchOutlined />}
                    onClick={() => router.push("/dashboard")}
                    className="px-6 py-2 rounded-full font-semibold !text-cyan-500 shadow-md">
                    {t('dashboard')}
                  </Button>
                  <Link href="/register">
                    <Button block type="primary"
                      className="rounded-full font-semibold
                        !bg-gradient-to-r !from-blue-400 !to-cyan-500
                        !border-0 text-white shadow-md">
                      {t('register')}
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