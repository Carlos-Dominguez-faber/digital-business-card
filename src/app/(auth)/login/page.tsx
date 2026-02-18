import Image from 'next/image'
import { LoginForm } from '@/features/auth/components'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="
        w-full max-w-md
        bg-white/[0.06] backdrop-blur-2xl
        border border-white/[0.08]
        rounded-[28px] shadow-2xl shadow-black/40
        p-8 space-y-8
        animate-fade-up
      ">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Image
              src="/icons/app-icon.svg"
              alt="Tarjeta Digital"
              width={40}
              height={40}
              className="opacity-90"
            />
          </div>
        </div>

        <div className="text-center">
          <h1 className="font-display text-3xl font-semibold text-white tracking-tight">Tarjeta Digital</h1>
          <p className="mt-2 text-white/40 tracking-wide">Inicia sesion para administrar tu tarjeta</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
