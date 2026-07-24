"use client";

export default function AdminError({ error, reset }) {
  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-2xl shadow-sm p-6 text-center">
      <p className="text-red-500 font-semibold mb-4">
        {error.message || "Ocurrió un error"}
      </p>
      <button onClick={() => reset()} className="text-sky-600 font-semibold">
        Volver a intentar
      </button>
    </div>
  );
}
