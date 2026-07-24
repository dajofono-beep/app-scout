import { Quicksand } from "next/font/google";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export default function AdminLayout({ children }) {
  return (
    <div
      className={`${quicksand.variable} min-h-screen`}
      style={{ fontFamily: "var(--font-quicksand)" }}
    >
      {children}
    </div>
  );
}
