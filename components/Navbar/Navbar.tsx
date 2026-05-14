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
    { key: "home",        label: t('home')       },
    { key: "features",    label: t('features')   },
    { key: "steps",       label: t('howItWorks') },
    { key: "categories",  label: t('categories') },
    { key: "leaderboard", label: t('leaderboard')},
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* ── LOGO ── */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 hover:opacity-80 transition-opacity">
          <Image src={logo} alt="PandoMind" width={36} height={36} />
          <span className="text-lg font-extrabold text-gray-900 dark:text-white">
            Pando<span className="text-cyan-500">Mind</span>
          </span>
        </Link>

        {/* ── MENU DESKTOP ── */}
        <div className="hidden md:flex items-center gap-1">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => scrollTo(item.key)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* ── RIGHT ACTIONS ── */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">

          {/* Séparateur */}
          <LanguageSwitcher />
          <div className="w-px h-5 bg-gray-200 dark:bg-slate-700 mx-1" />
          {mounted && <LightToDark />}
          <div className="w-px h-5 bg-gray-200 dark:bg-slate-700 mx-1" />

          {user ? (
            <>
              <Button
                icon={<FileSearchOutlined />}
                onClick={() => router.push("/dashboard")}
                className="!h-9 !px-4 !rounded-xl !text-sm !font-semibold !text-cyan-600 !border-cyan-200 dark:!border-cyan-800 hover:!bg-cyan-50 dark:hover:!bg-cyan-900/20 transition-all"
              >
                {t('dashboard')}
              </Button>
              <Button
                icon={<LogoutOutlined />}
                onClick={signOut}
                className="!h-9 !px-4 !rounded-xl !text-sm !font-semibold !text-white !bg-gradient-to-r !from-cyan-500 !to-teal-400 !border-0 hover:!opacity-90 transition-all shadow-sm shadow-cyan-200"
              >
                {t('logout')}
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  icon={<LoginOutlined />}
                  className="!h-9 !px-4 !rounded-xl !text-sm !font-semibold !text-cyan-600 !border-cyan-200 dark:!border-cyan-800 hover:!bg-cyan-50 dark:hover:!bg-cyan-900/20 transition-all"
                >
                  {t('login')}
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  icon={<UserAddOutlined />}
                  className="!h-9 !px-4 !rounded-xl !text-sm !font-semibold !text-white !bg-gradient-to-r !from-cyan-500 !to-teal-400 !border-0 hover:!opacity-90 transition-all shadow-sm shadow-cyan-200"
                >
                  {t('register')}
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* ── BURGER MOBILE ── */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      {/* ── MOBILE MENU ── */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex flex-col pt-3 gap-1">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => { scrollTo(item.key); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <LanguageSwitcher />
              {mounted && <LightToDark />}
            </div>
            {user ? (
              <>
                <Button
                  block icon={<FileSearchOutlined />}
                  onClick={() => { router.push("/dashboard"); setMenuOpen(false); }}
                  className="!h-10 !rounded-xl !font-semibold !text-cyan-600 !border-cyan-200"
                >
                  {t('dashboard')}
                </Button>
                <Button
                  block icon={<LogoutOutlined />}
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  className="!h-10 !rounded-xl !font-semibold !text-white !bg-gradient-to-r !from-cyan-500 !to-teal-400 !border-0"
                >
                  {t('logout')}
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  <Button block
                    className="!h-10 !rounded-xl !font-semibold !text-cyan-600 !border-cyan-200"
                    icon={<LoginOutlined />}
                  >
                    {t('login')}
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)}>
                  <Button block
                    className="!h-10 !rounded-xl !font-semibold !text-white !bg-gradient-to-r !from-cyan-500 !to-teal-400 !border-0"
                    icon={<UserAddOutlined />}
                  >
                    {t('register')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;