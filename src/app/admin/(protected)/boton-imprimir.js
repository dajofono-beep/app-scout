"use client";

export default function BotonImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden shrink-0 flex items-center gap-2 text-sm font-semibold text-sky-700 border border-sky-200 bg-white rounded-full pl-2 pr-4 py-1.5 hover:bg-sky-50"
    >
      <img src="/Dashboard/Impresion.png" alt="" className="w-6 h-6 object-contain" />
      Imprimir
    </button>
  );
}
