import Link from 'next/link'
import { ForgotPasswordForm } from '@/features/auth/components'

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="
        w-full max-w-md
        bg-white/10 backdrop-blur-xl
        border border-white/20
        rounded-3xl shadow-2xl
        p-8 space-y-8
      ">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Restablecer contrasena</h1>
          <p className="mt-2 text-white/60">Ingresa tu correo para recibir un enlace de restablecimiento</p>
        </div>

        <ForgotPasswordForm />

        <p className="text-center text-sm">
          <Link
            href="/login"
            className="
              inline-flex items-center gap-2
              text-white/70 hover:text-white
              transition-colors
            "
          >
            <span>←</span>
            <span>Volver al inicio</span>
          </Link>
        </p>
      </div>
    </div>
  )
}
