"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin/familias", label: "Familias" },
  { href: "/admin/descuentos", label: "Descuentos" },
  { href: "/admin/ramas", label: "Ramas" },
];

export default function NavAdminGroup() {
  const pathname = usePathname();
  const activo = ITEMS.some((item) => pathname.startsWith(item.href));
  const [abierto, setAbierto] = useState(activo);

  return (
    <div className="w-full md:mt-2 md:pt-2 md:border-t">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1"
      >
        <span>Administración</span>
        <span
          className={`inline-block transition-transform ${abierto ? "rotate-90" : ""}`}
        >
          ›
        </span>
      </button>
      {abierto && (
        <div className="flex flex-col gap-1 md:pl-2">
          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:underline"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
