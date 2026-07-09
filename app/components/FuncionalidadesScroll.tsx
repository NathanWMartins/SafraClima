"use client";

import { useEffect, useRef, useState } from "react";
import {
  Thermometer, Droplets, Wind, Sun,
  Snowflake, Flame, CloudRain, Zap,
  BarChart2, Scale, Activity, Download,
  Sprout, Leaf, Waves, CloudSun,
  type LucideIcon,
} from "lucide-react";

const PANEL_HEIGHT = 520;

const categorias: {
  titulo: string;
  subtitulo: string;
  descricao: string;
  items: { label: string; desc: string; Icon: LucideIcon }[];
}[] = [
  {
    titulo: "Monitoramento",
    subtitulo: "Cada área, dados precisos em tempo real",
    descricao: "Acompanhe temperatura, chuva, vento e solo de cada talhão individualizado, atualizado a cada hora.",
    items: [
      { label: "Temperatura e chuva", desc: "Máxima, mínima e precipitação diária por área", Icon: Thermometer },
      { label: "Umidade do solo", desc: "Evite perdas por excesso ou falta d'água", Icon: Droplets },
      { label: "Vento e UV", desc: "Velocidade, direção e índice ultravioleta", Icon: Wind },
      { label: "Evapotranspiração", desc: "Cálculo diário por cultura e estação", Icon: Sun },
    ],
  },
  {
    titulo: "Alertas",
    subtitulo: "Seja avisado antes do problema",
    descricao: "Receba notificações antecipadas para proteger sua produção e tomar decisões com tempo.",
    items: [
      { label: "Geada", desc: "Aviso com até 48h de antecedência", Icon: Snowflake },
      { label: "Seca prolongada", desc: "Déficit hídrico acumulado por período", Icon: Flame },
      { label: "Chuva intensa", desc: "Volume e probabilidade hora a hora", Icon: CloudRain },
      { label: "Vento forte", desc: "Risco de tombamento e deriva de defensivos", Icon: Zap },
    ],
  },
  {
    titulo: "Histórico",
    subtitulo: "Dados climáticos desde 1940",
    descricao: "Compare safras, identifique padrões climáticos e planeje o próximo ciclo com muito mais segurança.",
    items: [
      { label: "Série histórica completa", desc: "Temperatura e chuva desde 1940", Icon: BarChart2 },
      { label: "Comparativo de safras", desc: "Analise anos com clima semelhante ao atual", Icon: Scale },
      { label: "Anomalias climáticas", desc: "Identifique El Niño, La Niña e secas históricas", Icon: Activity },
      { label: "Exportação CSV", desc: "Dados brutos para suas próprias análises", Icon: Download },
    ],
  },
  {
    titulo: "Inteligência",
    subtitulo: "IA treinada para o campo brasileiro",
    descricao: "Recomendações personalizadas para cada cultura com base no clima real da sua área.",
    items: [
      { label: "Recomendações de plantio", desc: "Momento ideal por cultura e região", Icon: Sprout },
      { label: "Qualidade do ar", desc: "Fumaça de queimadas, poeira e índice UV", Icon: Leaf },
      { label: "Nível de rios", desc: "Monitoramento de risco de enchentes próximas", Icon: Waves },
      { label: "Previsão 7 dias", desc: "Atualizada a cada hora, por área cadastrada", Icon: CloudSun },
    ],
  },
];

const glassWrapper: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.12) 100%)",
  borderRadius: "17px",
  padding: "1px",
};

const glassCard: React.CSSProperties = {
  background: "rgba(18, 18, 24, 0.72)",
  borderRadius: "16px",
  backdropFilter: "blur(20px) saturate(160%)",
  WebkitBackdropFilter: "blur(20px) saturate(160%)",
  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.4)",
};

export function FuncionalidadesScroll() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current) return;
      const { top, height } = wrapperRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrolled = -top;
      const total = height - viewportHeight;
      const progress = Math.max(0, Math.min(1, scrolled / total));
      const index = Math.min(categorias.length - 1, Math.floor(progress * categorias.length));
      setActiveIndex(index);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToIndex = (i: number) => {
    if (!wrapperRef.current) return;
    const wTop = wrapperRef.current.getBoundingClientRect().top + window.scrollY;
    const total = wrapperRef.current.offsetHeight - window.innerHeight;
    const offset = wTop + (i / categorias.length) * total;
    window.scrollTo({ top: offset, behavior: "smooth" });
  };

  const offsets = ["ml-8", "ml-2", "ml-0", "ml-6"];

  return (
    <section id="funcionalidades" className="bg-[#020202]">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 text-center pt-24 pb-12">
        <span className="text-xs font-semibold tracking-widest text-white/30 uppercase">Funcionalidades</span>
      </div>

      {/* ── MOBILE: layout empilhado ── */}
      <div className="md:hidden px-5 pb-24 space-y-16">
        {categorias.map((cat) => (
          <div key={cat.titulo}>
            <p className="text-3xl font-black uppercase tracking-tight text-white mb-1">{cat.titulo}</p>
            <p className="text-xs text-white/40 mb-6 leading-relaxed">{cat.subtitulo}</p>
            <div className="grid grid-cols-2 gap-3">
              {cat.items.map(({ label, desc, Icon }) => (
                <div key={label} style={glassWrapper}>
                  <div className="p-4" style={glassCard}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: "rgba(178, 213, 229, 0.1)" }}>
                      <Icon className="w-4 h-4 text-[#B2D5E5]" strokeWidth={1.5} />
                    </div>
                    <p className="font-semibold text-white mb-1 text-xs">{label}</p>
                    <p className="text-[11px] text-white/30 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── DESKTOP: scroll interativo ── */}
      <div ref={wrapperRef} className="hidden md:block" style={{ height: `${categorias.length * 100}vh` }}>
        <div className="sticky top-0 h-screen flex items-center">
          <div className="max-w-6xl mx-auto px-6 w-full flex gap-16 lg:gap-24 items-center">

            {/* Esquerda: títulos em curva */}
            <div className="hidden md:flex flex-col w-110 flex-shrink-0">
              {categorias.map((c, i) => (
                <button
                  key={c.titulo}
                  onClick={() => scrollToIndex(i)}
                  className={`text-left mb-6 ${offsets[i]}`}
                >
                  <span className={`block font-black uppercase tracking-tight leading-none transition-all duration-500 ${
                    i === activeIndex
                      ? "text-white text-4xl lg:text-5xl"
                      : "text-white/15 text-3xl lg:text-4xl hover:text-white/30"
                  }`}>
                    {c.titulo}
                  </span>
                  {i === activeIndex && (
                    <span className="block text-xs text-white/40 mt-2 font-normal normal-case tracking-normal leading-relaxed">
                      {c.subtitulo}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Direita: carrossel vertical */}
            <div className="flex-1 min-w-0 mt-20  " style={{ height: PANEL_HEIGHT, overflow: "hidden" }}>
              <div
                style={{
                  transform: `translateY(-${activeIndex * PANEL_HEIGHT}px)`,
                  transition: "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
              >
                {categorias.map((cat) => (
                  <div key={cat.titulo} style={{ height: PANEL_HEIGHT }}>
                    <p className="md:hidden text-2xl font-black uppercase tracking-tight text-white mb-2">
                      {cat.titulo}
                    </p>
                    <p className="text-white/40 text-base mb-6 max-w-md leading-relaxed">
                      {cat.descricao}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 auto-rows-fr">
                      {cat.items.map(({ label, desc, Icon }) => (
                        <div key={label} style={glassWrapper} className="h-full">
                          <div className="p-5 h-full" style={glassCard}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                              style={{ background: "rgba(178, 213, 229, 0.1)" }}>
                              <Icon className="w-5 h-5 text-[#B2D5E5]" strokeWidth={1.5} />
                            </div>
                            <p className="font-semibold text-white mb-1 text-sm">{label}</p>
                            <p className="text-xs text-white/30 leading-relaxed">{desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
