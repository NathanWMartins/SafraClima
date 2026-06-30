import Image from "next/image";
import Link from "next/link";
import { Navbar } from "./components/Navbar";
import { RevealOnScroll } from "./components/RevealOnScroll";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconCloud() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 .916-7.38 5.25 5.25 0 0 0-10.233-2.33 3 3 0 0 0-3.758 3.848A4.5 4.5 0 0 0 2.25 15Z" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  );
}

function IconMap() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}

function IconAI() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
  );
}

function IconWind() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

// ─── Componentes ──────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-[#020202] overflow-hidden">
      {/* Foto de campo com overlay */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80&auto=format&fit=crop"
          alt="Campo agrícola"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-[#020202]/80 to-[#020202]/40" />
      </div>
      {/* Gradiente de fundo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#B2D5E5]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 grid md:grid-cols-2 gap-12 items-center">
        {/* Texto */}
        <div>
          <span className="inline-block text-xs font-semibold tracking-widest text-[#B2D5E5] uppercase mb-6">
            Inteligência Agrícola e Climática
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            O clima certo,<br />
            na hora certa,<br />
            <span className="text-[#B2D5E5]">na sua área.</span>
          </h1>
          <p className="text-lg text-white/60 leading-relaxed mb-8 max-w-md">
            Monitore temperatura, solo, chuva e qualidade do ar de cada área das suas lavouras. Receba alertas antes que o tempo vire problema.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/cadastro"
              className="inline-flex items-center justify-center bg-[#B2D5E5] text-[#020202] font-semibold px-6 py-3 rounded-lg hover:bg-[#9ac5d9] transition-colors"
            >
              Começar gratuitamente
            </Link>
            <a
              href="#funcionalidades"
              className="inline-flex items-center justify-center border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              Ver funcionalidades
            </a>
          </div>
          <p className="text-sm text-white/30 mt-4">Sem cartão de crédito. Plano gratuito para sempre.</p>
        </div>

        {/* Card de preview */}
        <div className="relative">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-white/40 mb-1">Área monitorada</p>
                <p className="text-white font-semibold">Fazenda São João — Soja</p>
              </div>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Ativo</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Temp. máx.", value: "32°C" },
                { label: "Chuva hoje", value: "12 mm" },
                { label: "Umidade solo", value: "68%" },
                { label: "UV índice", value: "7 Alto" },
              ].map((item) => (
                <div key={item.label} className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-white/40 mb-1">{item.label}</p>
                  <p className="text-white font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex items-start gap-3">
              <span className="text-yellow-400 text-lg">⚠</span>
              <div>
                <p className="text-sm text-yellow-300 font-medium">Alerta de seca</p>
                <p className="text-xs text-white/40 mt-0.5">Déficit hídrico elevado nos próximos 5 dias</p>
              </div>
            </div>
          </div>
          {/* Segundo card flutuante */}
          <div className="absolute -bottom-6 -right-4 bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm w-48 hidden md:block">
            <p className="text-xs text-white/40 mb-2">Previsão 7 dias</p>
            <div className="flex justify-between items-end gap-1">
              {[40, 65, 30, 80, 55, 20, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-[#B2D5E5]/30 rounded-sm"
                  style={{ height: `${h * 0.5}px` }}
                />
              ))}
            </div>
            <p className="text-xs text-white/30 mt-2">Precipitação (mm)</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const funcionalidades = [
  {
    icon: <IconMap />,
    titulo: "Monitoramento por área",
    descricao: "Cadastre cada talhão com coordenadas precisas e acompanhe dados climáticos individualizados para cada cultura.",
  },
  {
    icon: <IconCloud />,
    titulo: "Previsão 7 dias",
    descricao: "Temperatura, chuva, vento, umidade do solo e evapotranspiração — tudo em um único painel, atualizado a cada hora.",
  },
  {
    icon: <IconBell />,
    titulo: "Alertas inteligentes",
    descricao: "Receba notificações de geada, seca, chuva intensa e vento forte antes que aconteçam. Via e-mail e no painel.",
  },
  {
    icon: <IconChart />,
    titulo: "Histórico climático",
    descricao: "Acesse dados históricos desde 1940 para sua área. Compare safras, identifique padrões e planeje com mais segurança.",
  },
  {
    icon: <IconWind />,
    titulo: "Qualidade do ar e enchentes",
    descricao: "Monitore poeira, fumaça de queimadas, índice UV e nível de rios próximos — dados que impactam diretamente o campo.",
  },
  {
    icon: <IconAI />,
    titulo: "Recomendações com IA",
    descricao: "Receba sugestões de plantio personalizadas para soja, milho, café e outras culturas com base no clima da sua área.",
  },
];

function Funcionalidades() {
  return (
    <section id="funcionalidades" className="bg-[#F8FAFB] py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <span className="text-xs font-semibold tracking-widest text-[#020202]/40 uppercase">Funcionalidades</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#020202] mt-3 mb-4">
            Tudo que você precisa para<br />tomar a decisão certa
          </h2>
          <p className="text-[#020202]/50 max-w-xl mx-auto">
            Do monitoramento diário ao histórico de décadas — SafraClima reúne as informações climáticas mais relevantes para o produtor rural brasileiro.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funcionalidades.map((f, i) => (
            <div key={f.titulo} data-delay={i * 100} className="reveal bg-white rounded-2xl p-6 border border-[#020202]/5 hover:border-[#B2D5E5] transition-colors group">
              <div className="w-12 h-12 bg-[#B2D5E5]/20 rounded-xl flex items-center justify-center text-[#020202] mb-4 group-hover:bg-[#B2D5E5]/40 transition-colors">
                {f.icon}
              </div>
              <h3 className="font-semibold text-[#020202] mb-2">{f.titulo}</h3>
              <p className="text-sm text-[#020202]/50 leading-relaxed">{f.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const planos = [
  {
    nome: "Gratuito",
    preco: "R$ 0",
    periodo: "para sempre",
    descricao: "Ideal para quem está começando ou tem uma propriedade pequena.",
    destaque: false,
    cta: "Começar grátis",
    href: "/cadastro",
    itens: [
      "Até 2 áreas monitoradas",
      "Previsão 7 dias",
      "Alertas básicos (geada, chuva, seca)",
      "Dados de clima e solo",
      "Acesso via web",
    ],
    nao: [
      "Histórico climático",
      "Qualidade do ar e enchentes",
      "Recomendações com IA",
      "Alertas por e-mail",
    ],
  },
  {
    nome: "Pro",
    preco: "R$ 29",
    periodo: "por mês",
    descricao: "Para produtores que precisam de dados completos e análises avançadas.",
    destaque: true,
    cta: "Assinar o Pro",
    href: "/cadastro?plano=pro",
    itens: [
      "Áreas ilimitadas",
      "Previsão 7 dias",
      "Alertas inteligentes por cultura",
      "Alertas por e-mail (Resend)",
      "Histórico desde 1940",
      "Qualidade do ar e enchentes",
      "Recomendações com IA (soja, milho, café...)",
      "Exportação de dados em CSV",
    ],
    nao: [],
  },
];

function Planos() {
  return (
    <section id="planos" className="bg-[#020202] py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <span className="text-xs font-semibold tracking-widest text-[#B2D5E5]/60 uppercase">Planos</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4">
            Comece grátis, evolua quando precisar
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">
            Sem surpresas na fatura. Cancele quando quiser.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {planos.map((plano, i) => (
            <div
              key={plano.nome}
              data-delay={i * 150}
              className={`reveal rounded-2xl p-8 border ${
                plano.destaque
                  ? "bg-[#B2D5E5] border-[#B2D5E5] text-[#020202]"
                  : "bg-white/5 border-white/10 text-white"
              }`}
            >
              <p className={`text-sm font-semibold mb-1 ${plano.destaque ? "text-[#020202]/60" : "text-white/40"}`}>
                {plano.nome}
              </p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-bold">{plano.preco}</span>
                <span className={`text-sm mb-1 ${plano.destaque ? "text-[#020202]/60" : "text-white/40"}`}>
                  /{plano.periodo}
                </span>
              </div>
              <p className={`text-sm mb-6 ${plano.destaque ? "text-[#020202]/70" : "text-white/40"}`}>
                {plano.descricao}
              </p>
              <Link
                href={plano.href}
                className={`block text-center font-semibold px-6 py-3 rounded-lg mb-8 transition-colors ${
                  plano.destaque
                    ? "bg-[#020202] text-white hover:bg-[#020202]/80"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {plano.cta}
              </Link>
              <ul className="space-y-3">
                {plano.itens.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span className={`mt-0.5 flex-shrink-0 ${plano.destaque ? "text-[#020202]" : "text-[#B2D5E5]"}`}>
                      <IconCheck />
                    </span>
                    {item}
                  </li>
                ))}
                {plano.nao.map((item) => (
                  <li key={item} className={`flex items-start gap-2 text-sm ${plano.destaque ? "text-[#020202]/30" : "text-white/20"}`}>
                    <span className="mt-0.5 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProvasSocial() {
  const numeros = [
    { valor: "1940", label: "Histórico climático desde" },
    { valor: "7 dias", label: "De previsão por área" },
    { valor: "1h", label: "Atualização dos dados" },
    { valor: "7 APIs", label: "Fontes de dados integradas" },
  ];

  return (
    <section className="bg-[#020202] py-16 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {numeros.map((n, i) => (
            <div key={n.label} data-delay={i * 100} className="reveal text-center">
              <p className="text-3xl md:text-4xl font-bold text-[#B2D5E5] mb-2">{n.valor}</p>
              <p className="text-sm text-white/40">{n.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComoFunciona() {
  const passos = [
    {
      num: "01",
      titulo: "Cadastre sua área",
      descricao: "Adicione suas áreas com coordenadas GPS ou busque pelo nome da cidade. Informe a cultura plantada.",
    },
    {
      num: "02",
      titulo: "Receba dados em tempo real",
      descricao: "O SafraClima busca automaticamente dados de clima, solo, qualidade do ar e rios da sua área.",
    },
    {
      num: "03",
      titulo: "Tome decisões com segurança",
      descricao: "Alertas antecipados, histórico de décadas e recomendações de IA para cada cultura e momento.",
    },
  ];

  return (
    <section className="bg-white py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <span className="text-xs font-semibold tracking-widest text-[#020202]/40 uppercase">Como funciona</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#020202] mt-3 mb-4">
            Simples de usar,<br />poderoso nos resultados
          </h2>
          <p className="text-[#020202]/50 max-w-xl mx-auto">
            Em menos de 2 minutos você já tem dados climáticos precisos para sua área.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Linha conectora */}
          <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px bg-[#B2D5E5]/30" />
          {passos.map((p, i) => (
            <div key={p.num} data-delay={i * 150} className="reveal text-center md:text-left relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#B2D5E5]/15 text-[#020202] font-bold text-xl mb-6">
                {p.num}
              </div>
              <h3 className="font-semibold text-[#020202] text-lg mb-3">{p.titulo}</h3>
              <p className="text-[#020202]/50 text-sm leading-relaxed">{p.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTAFinal() {
  return (
    <section className="bg-[#B2D5E5] py-20">
      <div className="max-w-3xl mx-auto px-6 text-center reveal">
        <h2 className="text-3xl md:text-4xl font-bold text-[#020202] mb-4">
          O tempo não espera.<br />Sua decisão também não pode.
        </h2>
        <p className="text-[#020202]/60 text-lg mb-8 max-w-xl mx-auto">
          Comece a monitorar suas áreas hoje, gratuitamente. Sem burocracia, sem cartão de crédito.
        </p>
        <Link
          href="/cadastro"
          className="inline-flex items-center justify-center bg-[#020202] text-white font-semibold px-8 py-4 rounded-xl hover:bg-[#020202]/80 transition-colors text-lg"
        >
          Criar conta grátis agora
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#fefefe] border-t border-white/5 py-1">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <Image
          src="/LogoSafraClima.png"
          alt="SafraClima"
          width={120}
          height={34}
          className="h-40 w-auto"
        />
        <p className="text-sm text-black/80">
          © {new Date().getFullYear()} SafraClima. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>
      <RevealOnScroll />
      <Navbar />
      <Hero />
      <ProvasSocial />
      <ComoFunciona />
      <Funcionalidades />
      <Planos />
      <CTAFinal />
      <Footer />
    </>
  );
}
