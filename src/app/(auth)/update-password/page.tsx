import { UpdatePasswordForm } from '@/features/auth/components'

export default function UpdatePasswordPage() {
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
          <h1 className="text-3xl font-bold text-white">Nueva contrasena</h1>
          <p className="mt-2 text-white/60">Ingresa tu nueva contrasena</p>
        </div>

        <UpdatePasswordForm />
      </div>
    </div>
  )
}
