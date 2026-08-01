"use client";

import { useEffect, useRef, useState } from "react";
import { preguntarConsulta } from "./consultas-actions";

function IconoMicrofono({ className }) {
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
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

export default function Consultas() {
  const [historial, setHistorial] = useState([]);
  const [pregunta, setPregunta] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [soportaVoz, setSoportaVoz] = useState(false);
  const [escuchando, setEscuchando] = useState(false);
  const reconocimientoRef = useRef(null);

  useEffect(() => {
    const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSoportaVoz(Boolean(Reconocimiento));
  }, []);

  function alternarEscucha() {
    const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Reconocimiento) return;

    if (escuchando) {
      reconocimientoRef.current?.stop();
      return;
    }

    const reconocimiento = new Reconocimiento();
    reconocimiento.lang = "es-AR";
    reconocimiento.interimResults = false;
    reconocimiento.maxAlternatives = 1;

    reconocimiento.onresult = (e) => {
      setPregunta(e.results[0][0].transcript);
    };
    reconocimiento.onerror = () => {
      setEscuchando(false);
    };
    reconocimiento.onend = () => {
      setEscuchando(false);
    };

    reconocimientoRef.current = reconocimiento;
    reconocimiento.start();
    setEscuchando(true);
  }

  async function enviar(e) {
    e.preventDefault();
    const texto = pregunta.trim();
    if (!texto || loading) return;

    setError(null);
    const nuevoHistorial = [...historial, { rol: "usuario", texto }];
    setHistorial(nuevoHistorial);
    setPregunta("");
    setLoading(true);

    try {
      const resultado = await preguntarConsulta(nuevoHistorial);
      if (!resultado.ok) {
        setError(resultado.error);
      } else {
        setHistorial((h) => [...h, { rol: "asistente", texto: resultado.texto }]);
      }
    } catch (err) {
      setError("Ocurrió un error inesperado. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm p-5">
      <p className="font-bold text-slate-800 mb-1">Consultas</p>
      <p className="text-xs text-slate-400 mb-3">
        Puede cometer errores — confirmá lo importante con el Consejo de Grupo.
      </p>

      <div className="space-y-3 max-h-[24rem] overflow-y-auto mb-3">
        {historial.length === 0 && (
          <div className="flex justify-start items-end gap-2">
            <img
              src="/Consultas/Esperando.gif"
              alt="SanMa esperando"
              className="w-14 h-14 rounded-full object-cover shrink-0"
            />
            <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm bg-slate-100 text-slate-700">
              ¡Hola! Soy SanMa, el asistente virtual del Grupo Scout Libertador
              San Martín. ¿En qué te puedo ayudar hoy?
            </div>
          </div>
        )}
        {historial.map((m, i) => (
          <div key={i} className={`flex ${m.rol === "usuario" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                m.rol === "usuario"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {m.texto}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start items-end gap-2">
            <img
              src="/Consultas/Pensando.gif"
              alt="SanMa pensando"
              className="w-14 h-14 rounded-full object-cover shrink-0"
            />
            <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm bg-slate-100 text-slate-400">
              Pensando...
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500 font-semibold mb-2">{error}</p>}

      <form onSubmit={enviar} className="flex gap-2">
        <input
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          placeholder={escuchando ? "Escuchando..." : "Escribí tu pregunta..."}
          disabled={loading}
          className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm disabled:bg-slate-50"
        />
        {soportaVoz && (
          <button
            type="button"
            onClick={alternarEscucha}
            disabled={loading}
            aria-label={escuchando ? "Detener grabación" : "Preguntar por voz"}
            className={`md:hidden rounded-full w-10 h-10 flex items-center justify-center shrink-0 disabled:opacity-50 ${
              escuchando
                ? "bg-red-500 text-white animate-pulse"
                : "border border-slate-200 text-slate-500"
            }`}
          >
            <IconoMicrofono className="w-5 h-5" />
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !pregunta.trim()}
          className="bg-sky-600 text-white rounded-full px-5 py-2.5 text-sm font-bold disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </section>
  );
}
