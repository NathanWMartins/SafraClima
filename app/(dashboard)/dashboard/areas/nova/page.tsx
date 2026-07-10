"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { criarArea } from "@/app/actions/areas";
import Link from "next/link";
import { ArrowLeft, MapPin, Loader2, Search, CheckCircle2 } from "lucide-react";

const MapPicker = dynamic(
  () => import("./MapPicker").then((m) => m.MapPicker),
  { ssr: false, loading: () => <div className="h-[320px] rounded-2xl bg-white/5 animate-pulse" /> }
);

const culturas = [
  { value: "SOJA", label: "Soja" },
  { value: "MILHO", label: "Milho" },
  { value: "CAFE", label: "Café" },
  { value: "ALGODAO", label: "Algodão" },
  { value: "CANA", label: "Cana-de-açúcar" },
  { value: "ARROZ", label: "Arroz" },
  { value: "FEIJAO", label: "Feijão" },
  { value: "TRIGO", label: "Trigo" },
  { value: "OUTROS", label: "Outros" },
];

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full flex items-center justify-center gap-2 bg-[#B2D5E5] text-[#020202] font-semibold px-4 py-3 rounded-xl hover:bg-[#B2D5E5]/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {pending ? (
        <><Loader2 className="w-4 h-4 animate-spin" />Salvando…</>
      ) : (
        <><CheckCircle2 className="w-4 h-4" strokeWidth={2} />Cadastrar área</>
      )}
    </button>
  );
}

const inputClass =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#B2D5E5]/50 focus:bg-white/8 transition-colors";

const labelClass =
  "block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider";

export default function NovaAreaPage() {
  const [state, action] = useActionState(criarArea, null);

  // Campos controlados — não são resetados ao retornar erro do server action
  const [nome, setNome] = useState("");
  const [cultura, setCultura] = useState("");
  const [endereco, setEndereco] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  // Estado do geocoding
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);

  const handleCoordsChange = useCallback((newLat: number, newLng: number) => {
    setLat(newLat.toString());
    setLng(newLng.toString());
  }, []);

  async function buscarLocalizacao() {
    if (!endereco.trim()) return;
    setGeoLoading(true);
    setGeoError(null);
    setLocationName(null);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(endereco)}&format=json&limit=1&countrycodes=br`,
        { headers: { "User-Agent": "SafraClima/1.0 (nathanwillmartins@gmail.com)", "Accept-Language": "pt-BR" } }
      );
      const data = await res.json();

      if (!data.length) {
        setGeoError("Localização não encontrada. Tente 'Sorriso, MT' ou 'Ribeirão Preto, SP'.");
        return;
      }

      const foundLat = parseFloat(data[0].lat);
      const foundLng = parseFloat(data[0].lon);
      const shortName = (data[0].display_name as string).split(",").slice(0, 3).join(",");

      setLocationName(shortName);
      handleCoordsChange(foundLat, foundLng);
    } catch {
      setGeoError("Erro ao buscar localização. Verifique sua conexão.");
    } finally {
      setGeoLoading(false);
    }
  }

  const hasCoords = lat !== "" && lng !== "";

  return (
    <div className="p-6 md:p-8 max-w-xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/areas"
          className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Minhas Áreas
        </Link>
        <h1 className="text-2xl font-bold text-white">Nova Área</h1>
        <p className="text-white/40 mt-1 text-sm">
          Adicione uma área para monitorar o clima em tempo real.
        </p>
      </div>

      <form action={action} className="space-y-5">
        {state?.error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
            {state.error}
          </div>
        )}

        {/* Coords como inputs controlados */}
        <input type="hidden" name="lat" value={lat} readOnly />
        <input type="hidden" name="lng" value={lng} readOnly />

        {/* Nome */}
        <div>
          <label htmlFor="nome" className={labelClass}>Nome da área</label>
          <input
            id="nome"
            name="nome"
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Talhão 1, Fazenda São João…"
            className={inputClass}
          />
        </div>

        {/* Cultura */}
        <div>
          <label htmlFor="cultura" className={labelClass}>Cultura plantada</label>
          <select
            id="cultura"
            name="cultura"
            required
            value={cultura}
            onChange={(e) => setCultura(e.target.value)}
            className={`${inputClass} appearance-none cursor-pointer`}
          >
            <option value="" disabled className="bg-[#111] text-white/40">Selecione a cultura…</option>
            {culturas.map((c) => (
              <option key={c.value} value={c.value} className="bg-[#111] text-white">{c.label}</option>
            ))}
          </select>
        </div>

        {/* Busca de localização */}
        <div>
          <label className={labelClass}>Localização</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), buscarLocalizacao())}
              placeholder="Ex: Sorriso, MT  /  Seara, SC"
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={buscarLocalizacao}
              disabled={geoLoading || !endereco.trim()}
              className="flex items-center gap-2 bg-white/8 border border-white/10 text-white px-4 rounded-xl text-sm font-medium hover:bg-white/12 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" strokeWidth={1.5} />}
              {geoLoading ? "Buscando…" : "Buscar"}
            </button>
          </div>

          {geoError && <p className="text-xs text-red-400 mt-2">{geoError}</p>}

          {locationName && (
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="w-3.5 h-3.5 text-[#B2D5E5] flex-shrink-0" strokeWidth={2} />
              <p className="text-xs text-[#B2D5E5]/80 truncate">{locationName}</p>
            </div>
          )}
        </div>

        {/* Mapa */}
        {hasCoords && (
          <div className="space-y-2">
            <div className="rounded-2xl overflow-hidden border border-white/8">
              <MapPicker
                lat={parseFloat(lat)}
                lng={parseFloat(lng)}
                onChange={handleCoordsChange}
              />
            </div>
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-white/25">
                Arraste o pin ou clique no mapa para ajustar a posição exata.
              </p>
              <p className="text-xs text-white/20 font-mono">
                {parseFloat(lat).toFixed(5)}, {parseFloat(lng).toFixed(5)}
              </p>
            </div>
          </div>
        )}

        {!hasCoords && (
          <div className="h-20 rounded-2xl border border-dashed border-white/8 flex items-center justify-center">
            <p className="text-xs text-white/20">Busque a localização para ver o mapa</p>
          </div>
        )}

        <div className="border-t border-white/5 pt-2" />

        <SubmitButton disabled={!hasCoords} />

        {!hasCoords && (
          <p className="text-center text-xs text-white/20">
            Busque e ajuste a localização no mapa para continuar.
          </p>
        )}
      </form>
    </div>
  );
}
