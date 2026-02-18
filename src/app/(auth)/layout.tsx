export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#050505] noise-overlay">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 right-1/4 w-[450px] h-[450px] bg-amber-500/[0.06] rounded-full blur-[120px] animate-blob" />
        <div className="absolute -bottom-48 -left-24 w-[400px] h-[400px] bg-orange-600/[0.04] rounded-full blur-[100px] animate-blob-delay-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-500/[0.03] rounded-full blur-[100px] animate-blob-delay-4" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
