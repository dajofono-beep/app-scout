const GRUPOS = [
  {
    titulo: "Autorizaciones Anuales",
    icono: "Autorizaciones.png",
    archivos: [
      {
        nombre: "Autorización de Ingreso de Niños, Niñas y Jóvenes Menores de 18 Años",
        archivo: "Autorizacion-de-Ingreso-de-Ninos-Ninas-y-Jovenes-Menores-de-18-Anos.pdf",
      },
      {
        nombre: "Autorización de Uso de Imagen de Niños, Niñas y Jóvenes Menores de 18 Años",
        archivo: "Autorizacion-Uso-de-Imagen-Ninos-Ninas-y-Jovenes-Menores-de-18-Anos.pdf",
      },
      {
        nombre: "Autorización Anual para Salidas Cercanas",
        archivo: "Autorizacion-Anual-para-Salidas-Cercanas.pdf",
      },
    ],
  },
  {
    titulo: "Autorizaciones para Salidas y Campamentos",
    icono: "Campamentos.png",
    archivos: [
      {
        nombre:
          "Autorización de Padres, Madres y Tutores para Salidas, Acantonamientos y Campamentos",
        archivo: "Autorizacion-de-Padres-Madres-Tutores-para-Salidas-Acantonamientos-Campamentos.pdf",
      },
    ],
  },
];

function IconoDescarga({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" />
    </svg>
  );
}

export default function Descargas() {
  return (
    <div className="space-y-4">
      {GRUPOS.map((grupo) => (
        <section key={grupo.titulo} className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="flex items-center gap-2 font-bold text-slate-800 mb-3">
            <img
              src={`/Descargas/${grupo.icono}`}
              alt=""
              className="w-10 h-10 object-contain shrink-0"
            />
            {grupo.titulo}
          </h2>
          <div className="space-y-2">
            {grupo.archivos.map((a) => (
              <a
                key={a.archivo}
                href={`/Descargas/${a.archivo}`}
                download
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-sky-300 hover:bg-sky-50"
              >
                <IconoDescarga className="w-5 h-5 text-sky-600 shrink-0" />
                {a.nombre}
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
