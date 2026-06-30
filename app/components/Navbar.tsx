"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm border-b border-black/5 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <Image
          src="/LogoSafraClimaHeader.png"
          alt="SafraClima"
          width={200}
          height={100}
          className={`h-20 w-auto transition-all duration-300 ${
            scrolled ? "brightness-100" : "brightness-0 invert"
          }`}
        />
        <nav
          className={`hidden md:flex items-center gap-8 text-sm transition-colors duration-300 ${
            scrolled ? "text-[#020202]/60" : "text-white/70"
          }`}
        >
          <a
            href="#funcionalidades"
            className={`transition-colors ${scrolled ? "hover:text-[#020202]" : "hover:text-white"}`}
          >
            Funcionalidades
          </a>
          <a
            href="#planos"
            className={`transition-colors ${scrolled ? "hover:text-[#020202]" : "hover:text-white"}`}
          >
            Planos
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={`text-sm transition-colors duration-300 ${
              scrolled ? "text-[#020202]/60 hover:text-[#020202]" : "text-white/70 hover:text-white"
            }`}
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-300 ${
              scrolled
                ? "bg-[#020202] text-white hover:bg-[#020202]/80"
                : "bg-[#B2D5E5] text-[#020202] hover:bg-[#9ac5d9]"
            }`}
          >
            Começar grátis
          </Link>
        </div>
      </div>
    </header>
  );
}
