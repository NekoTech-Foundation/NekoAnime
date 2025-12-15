"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/hooks/useAuthStore"
import { LoginDialog } from "@/components/auth/login-dialog"
import { IconSolid } from "@/components/theme-csgo/icon-solid"
import {
  Bell,
  Home,
  LogIn,
  LogOut,
  Menu,
  Search,
  Trophy,
  X,
  Calendar,
  Heart,
  History,
  List
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Chào buổi sáng"
  if (hour < 18) return "Chào buổi chiều"
  return "Chào buổi tối"
}

export default function CSGOLayout({ children }: DashboardLayoutProps) {
  const { user, isLogged, logout, uid } = useAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showFloatingNav, setShowFloatingNav] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [greeting, setGreeting] = useState("Chào bạn")
  const pathname = usePathname()
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Update greeting on mount to match client time
    // Wrapped in setTimeout to avoid "setState synchronously within an effect" warning/error
    const timer = setTimeout(() => {
        setGreeting(getGreeting())
    }, 0)

    const interval = setInterval(() => {
      setGreeting(getGreeting())
    }, 60000)
    
    return () => {
        clearTimeout(timer)
        clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const mainElement = mainRef.current
    if (!mainElement) return

    const handleScroll = () => {
      if (mainElement.scrollTop > 100) {
        setShowFloatingNav(true)
      } else {
        setShowFloatingNav(false)
      }
    }

    mainElement.addEventListener("scroll", handleScroll)
    return () => mainElement.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "/", label: "Trang Chủ", icon: Home },
    { href: "/danh-sach", label: "Danh Sách", icon: List },
    { href: "/lich-chieu", label: "Lịch Chiếu", icon: Calendar },
    { href: "/bang-xep-hang", label: "Bảng Xếp Hạng", icon: Trophy },
    { href: "/theo-doi", label: "Đang Theo Dõi", icon: Heart },
    { href: "/lich-su", label: "Lịch Sử", icon: History },
  ]

  return (
    <>
      <div
        className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 max-md:hidden ${
          showFloatingNav ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none invisible"
        }`}
      >
        <div className="bg-bg-sidebar/95 backdrop-blur-md px-6 py-3 rounded-[20px] flex items-center gap-5 shadow-2xl border border-white/10 w-max">
          <div className="text-base font-normal text-[#aaa] whitespace-nowrap">
            {isLogged() && user ? (
              <span>
                {greeting}, <span className="text-white font-bold">{user.name}</span>
              </span>
            ) : (
              <span>
                {greeting}, <span className="text-white font-bold">Khách</span>
              </span>
            )}
          </div>
          <button className="bg-card-bg border-none w-9 h-9 rounded-full text-white flex items-center justify-center cursor-pointer relative hover:bg-[#4a2a30] transition-colors flex-shrink-0">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent-primary rounded-full"></span>
          </button>
          {isLogged() ? (
            <button
              onClick={() => logout()}
              className="bg-accent-primary border-none px-4 py-2 rounded-full text-white flex items-center gap-2 cursor-pointer hover:bg-[#ff6b76] transition-colors text-sm whitespace-nowrap flex-shrink-0"
              title="Đăng xuất"
            >
              <LogOut size={18} />
              <span>Đăng Xuất</span>
            </button>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="bg-accent-primary border-none px-4 py-2 rounded-full text-white flex items-center gap-2 cursor-pointer hover:bg-[#ff6b76] transition-colors text-sm whitespace-nowrap flex-shrink-0"
              title="Đăng nhập"
            >
              <LogIn size={18} />
              <span>Đăng Nhập</span>
            </button>
          )}
        </div>
      </div>

      <header className="hidden max-md:flex fixed top-0 left-0 right-0 z-50 bg-bg-sidebar h-16 items-center justify-between px-5 border-b border-white/5">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="w-10 h-10 flex items-center justify-center text-white"
        >
          <Menu size={24} />
        </button>
        <div className="w-8 h-8 bg-white text-black font-black text-lg flex items-center justify-center rounded-lg">
          <IconSolid className="w-5 h-5" />
        </div>
        <div className="w-10 h-10"></div>
      </header>
      
      {isMobileMenuOpen && (
        <>
          <div
            className="hidden max-md:block fixed inset-0 bg-black/60 z-[60]"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          <aside className="hidden max-md:flex fixed left-0 top-0 bottom-0 w-64 bg-bg-sidebar z-[70] flex-col p-5">
            <div className="flex items-center justify-between mb-10">
              <div className="w-10 h-10 bg-white text-black font-black text-2xl flex items-center justify-center rounded-lg">
                <IconSolid className="w-5 h-5" />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center text-white"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="flex flex-col gap-5 flex-1 overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-4 transition-colors duration-300 p-3 rounded-lg hover:bg-white/5 ${
                        pathname === link.href ? "text-accent-primary" : "text-text-secondary hover:text-accent-primary"
                    }`}
                >
                    <link.icon size={24} />
                    <span>{link.label}</span>
                </Link>
              ))}
            </nav>

            {isLogged() && user && (
              <div className="p-4 border-t border-white/10 mt-auto">
                <Link href={`/user/${uid() || 'me'}`} className="flex items-center gap-3 hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#555] border-2 border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={user.avatar || 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg'}
                      alt={user.name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{user.name}</p>
                    <p className="text-text-secondary text-sm">Neko Member</p>
                  </div>
                </Link>
              </div>
            )}
          </aside>
        </>
      )}

      <div className="flex w-[96vw] h-[92vh] max-w-[1600px] bg-bg-dark rounded-[40px] overflow-hidden shadow-2xl max-lg:w-full max-lg:h-screen max-lg:rounded-none max-md:flex-col max-md:h-screen max-md:overflow-y-auto max-md:pt-16 max-md:p-0 max-md:w-full max-md:rounded-none m-auto">
        <aside className="w-24 m-5 mr-0 bg-bg-sidebar flex flex-col items-center py-6 rounded-[30px] max-md:hidden shrink-0">
          <Link href={"/"}>
            <div className="w-12 h-12 bg-white text-black font-black text-2xl flex items-center justify-center rounded-[14px] mb-10 shadow-lg shadow-white/10">
              <IconSolid className="w-6 h-6" />
            </div>
          </Link>
          <nav className="flex flex-col gap-8 flex-1 overflow-y-auto scrollbar-hide py-2 w-full px-2 items-center">
            {navLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-colors duration-300 flex items-center justify-center ${
                        pathname === link.href ? "text-accent-primary" : "text-text-secondary hover:text-accent-primary"
                    }`}
                    title={link.label}
                >
                    <link.icon size={26} className="text-current transition-transform duration-300 group-hover:scale-110" />
                </Link>
            ))}
          </nav>
          
          {isLogged() && user && (
              <Link href={`/user/${uid() || 'me'}`} className="mt-3 mb-2">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#555] border-2 border-white/10 hover:border-accent-primary transition-colors cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={user.avatar || 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg'}
                    alt={user.name || 'User'}
                    className="w-full h-full object-cover"
                />
                </div>
            </Link>
          )}
        </aside>

        <main
          ref={mainRef}
          className="flex-1 p-7.5 overflow-y-auto flex flex-col scrollbar-hide max-md:p-5 max-md:overflow-visible relative"
        >
          {/* Header (Desktop Only) */}
          <header className="flex justify-between items-center mb-[30px] flex-wrap gap-5 max-md:hidden">
            <div className="text-2xl font-normal text-[#aaa]">
              {isLogged() && user ? (
                <h1>
                  {greeting}, <span className="text-white font-bold">{user.name}</span>
                </h1>
              ) : (
                <h1>
                  {greeting}, <span className="text-white font-bold">Khách</span>
                </h1>
              )}
            </div>
            <div className="flex items-center gap-5">
              <div className="bg-card-bg px-5 py-2.5 rounded-[20px] flex items-center gap-2.5 text-[#aaa] w-[300px]">
                <Search size={24} />
                <input
                  type="text"
                  placeholder="Tìm kiếm anime..."
                  className="bg-transparent border-none text-white outline-none w-full placeholder-[#aaa]"
                />
              </div>
              <button className="bg-card-bg border-none w-10 h-10 rounded-full text-white flex items-center justify-center cursor-pointer relative hover:bg-[#4a2a30] transition-colors">
                <Bell size={24} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent-primary rounded-full"></span>
              </button>
              {isLogged() ? (
                <button
                  onClick={() => logout()}
                  className="bg-accent-primary border-none px-4 py-2 rounded-full text-white flex items-center gap-2 cursor-pointer hover:bg-[#ff6b76] transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut size={20} />
                  <span>Đăng Xuất</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-accent-primary border-none px-4 py-2 rounded-full text-white flex items-center gap-2 cursor-pointer hover:bg-[#ff6b76] transition-colors"
                  title="Đăng nhập"
                >
                  <LogIn size={20} />
                  <span className="line-clamp-1">Đăng Nhập</span>
                </button>
              )}
            </div>
          </header>
          {children}
        </main>
      </div>
      <LoginDialog isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  )
}
