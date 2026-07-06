"use client";

export default function AdminError({ error, reset }) {
  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded shadow p-6 text-center">
      <p className="text-red-600 font-medium mb-4">
        {error.message || "Ocurrió un error"}
      </p>
      <button onClick={() => reset()} className="text-blue-600 underline">
        Volver a intentar
      </button>
    </div>
  );
}
