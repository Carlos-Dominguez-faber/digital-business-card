'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center px-4">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600/8 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-md">
        {/* Offline Icon */}
        <div className="w-24 h-24 mx-auto mb-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center">
          <svg
            className="w-12 h-12 text-white/70"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a5 5 0 01-.707-7.07m-2.122 9.192a9 9 0 010-12.728"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Sin Conexion
        </h1>

        <p className="text-white/60 mb-8">
          Parece que perdiste tu conexion a internet.
          Revisa tu conexion e intenta de nuevo.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="
            inline-flex items-center gap-2
            px-6 py-3
            bg-white/10 backdrop-blur-xl
            border border-white/20
            text-white font-medium
            rounded-2xl
            hover:bg-white/20
            active:scale-95
            transition-all duration-200
          "
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Reintentar
        </button>

        <p className="mt-8 text-xs text-white/40">
          Algunas funciones pueden estar disponibles sin conexion una vez que las hayas visitado.
        </p>
      </div>
    </div>
  )
}
