import Link from 'next/link'

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="
        w-full max-w-md
        bg-white/10 backdrop-blur-xl
        border border-white/20
        rounded-3xl shadow-2xl
        p-8 space-y-6
        text-center
      ">
        <div className="text-6xl">📧</div>

        <div>
          <h1 className="text-3xl font-bold text-white">Revisa tu correo</h1>
          <p className="mt-3 text-white/60">
            Te enviamos un enlace. Revisa tu correo para continuar.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/login"
            className="
              inline-flex items-center gap-2
              text-white/80 hover:text-white
              transition-colors
            "
          >
            <span>←</span>
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
