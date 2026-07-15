"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Bell, BarChart3, User } from "lucide-react";

const tabs = [
  { href: "/dashboard", label: "Início", Icon: Home },
  { href: "/dashboard/areas", label: "Áreas", Icon: MapPin },
  { href: "/dashboard/alertas", label: "Alertas", Icon: Bell },
  { href: "/dashboard/historico", label: "Histórico", Icon: BarChart3 },
  { href: "/dashboard/conta", label: "Conta", Icon: User },
];

export function TabBar({ alertasNaoLidos = 0 }: { alertasNaoLidos?: number }) {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
    >
      <div
        className="flex items-center justify-around gap-1 px-3 py-2 rounded-2xl"
        style={{
          background: "rgba(15, 15, 15, 0.25)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          const badge = href === "/dashboard/alertas" && alertasNaoLidos > 0 ? alertasNaoLidos : 0;
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors min-w-0 ${
                active ? "text-white" : "text-white/35"
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 1.5} />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[9px] font-bold min-w-[14px] h-[14px] rounded-full flex items-center justify-center px-0.5">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${active ? "text-white" : "text-white/35"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
