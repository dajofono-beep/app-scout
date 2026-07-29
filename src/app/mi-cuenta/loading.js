export default function CargandoMiCuenta() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-sky-50 px-4">
      <svg viewBox="0 0 100 100" className="w-16 h-16">
        <circle cx="50" cy="50" r="46" fill="none" stroke="#0284c7" strokeWidth="6" />
        <line x1="50" y1="6" x2="50" y2="14" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
        <line x1="50" y1="86" x2="50" y2="94" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
        <line x1="6" y1="50" x2="14" y2="50" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
        <line x1="86" y1="50" x2="94" y2="50" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
        <g className="animate-spin" style={{ transformOrigin: "50px 50px" }}>
          <polygon points="50,18 60,50 50,82 40,50" fill="#0284c7" />
        </g>
        <circle cx="50" cy="50" r="5" fill="#f8fafc" stroke="#0284c7" strokeWidth="2" />
      </svg>
      <p className="text-sm font-semibold text-slate-500">Cargando tu cuenta...</p>
    </div>
  );
}
