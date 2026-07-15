"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Home, MapPin, Bell, BarChart3, LogOut } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Início", Icon: Home },
  { href: "/dashboard/areas", label: "Minhas Áreas", Icon: MapPin },
  { href: "/dashboard/alertas", label: "Alertas", Icon: Bell, badgeKey: "alertas" },
  { href: "/dashboard/historico", label: "Histórico", Icon: BarChart3 },
];

type User = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function Sidebar({ user, alertasNaoLidos = 0 }: { user: User; alertasNaoLidos?: number }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-50 bg-[#fefefe] flex-col z-40 border-r border-black/8">
      <div className="border-b border-black/8 mt-5 mb-2 ">
        <Image src="/LogoSafraClima.png" alt="SafraClima" width={140} height={140} className="h-20 w-auto" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, Icon, badgeKey }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          const badge = badgeKey === "alertas" && alertasNaoLidos > 0 ? alertasNaoLidos : 0;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active ? "bg-[#020202]/8 text-[#020202]" : "text-[#020202]/40 hover:text-[#020202] hover:bg-[#020202]/5"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.5} />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-black/8">
        <Link href="/dashboard/conta" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#020202]/5 transition-colors mb-1">
          {user.image ? (
            <Image src={user.image} alt={user.name ?? ""} width={32} height={32} className="rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#020202]/10 flex items-center justify-center text-[#020202] text-sm font-semibold">
              {user.name?.[0] ?? "U"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#020202] font-medium truncate">{user.name}</p>
            <p className="text-xs text-[#020202]/40 truncate">{user.email}</p>
          </div>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#020202]/40 hover:text-[#020202]/70 hover:bg-[#020202]/5 transition-colors"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
          Sair
        </button>
      </div>
    </aside>
  );
}