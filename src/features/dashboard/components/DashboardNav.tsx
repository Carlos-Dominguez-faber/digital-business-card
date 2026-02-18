'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signout } from '@/actions/auth'
import type { Profile } from '@/types/database'

interface DashboardNavProps {
  profile: Profile | null
}

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: '/icons/chart.svg' },
  { href: '/dashboard/contacts', label: 'Contactos', icon: '/icons/users.svg' },
  { href: '/dashboard/card', label: 'Mi Tarjeta', icon: '/icons/card.svg' },
  { href: '/dashboard/settings', label: 'Ajustes', icon: '/icons/settings.svg' },
]

export function DashboardNav({ profile }: DashboardNavProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3">
              <Image
                src="/icons/briefcase.svg"
                alt="Logo"
                width={24}
                height={24}
                className="opacity-90 invert"
              />
              <span className="font-bold text-white tracking-wide">Tarjeta Digital</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2
                    px-4 py-2 rounded-2xl
                    text-sm font-medium
                    transition-all duration-200
                    ${pathname === item.href
                      ? 'bg-white/[0.08] text-white'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                    }
                  `}
                >
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={18}
                    height={18}
                    className="opacity-80 invert"
                  />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/qr"
                className="
                  flex items-center justify-center
                  w-9 h-9
                  bg-white/[0.06] backdrop-blur-md
                  border border-white/[0.08]
                  text-white/80
                  rounded-xl
                  hover:bg-white/[0.1] hover:text-white
                  transition-all duration-300
                "
                title="Mostrar QR"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75H16.5v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                </svg>
              </Link>
              {profile?.username && (
                <Link
                  href={`/c/${profile?.username}`}
                  target="_blank"
                  className="
                    hidden sm:flex items-center gap-2
                    px-4 py-2
                    bg-white/[0.06] backdrop-blur-md
                    border border-white/[0.08]
                    text-white/80
                    rounded-2xl text-sm font-medium tracking-wide
                    hover:bg-white/[0.1] hover:text-white
                    transition-all duration-300
                  "
                >
                  <Image
                    src="/icons/eye.svg"
                    alt="View"
                    width={16}
                    height={16}
                    className="opacity-80 invert"
                  />
                  Ver Tarjeta
                </Link>
              )}

              <form action={signout}>
                <button
                  type="submit"
                  className="
                    px-4 py-2
                    text-sm text-white/60
                    hover:text-white
                    transition-colors
                  "
                >
                  Cerrar Sesion
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#050505]/95 backdrop-blur-2xl border-t border-white/[0.06] safe-area-bottom">
        <div className="flex justify-around py-2 pb-safe">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-1
                px-4 py-2
                text-xs font-medium
                transition-all duration-200
                ${pathname === item.href
                  ? 'text-amber-400'
                  : 'text-white/35 hover:text-white/60'
                }
              `}
            >
              <Image
                src={item.icon}
                alt={item.label}
                width={22}
                height={22}
                className={`invert transition-opacity ${pathname === item.href ? 'opacity-100' : 'opacity-50'}`}
              />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
