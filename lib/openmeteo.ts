export interface ClimaAtual {
  temperatura: number;
  sensacaoTermica: number;
  umidade: number;
  weatherCode: number;
  vento: number;
  precipitacao: number;
}

export interface PrevisaoDiaria {
  data: string;
  tempMax: number;
  tempMin: number;
  precipitacao: number;
  probChuva: number;
  uvMax: number;
  ventoMax: number;
  weatherCode: number;
  evapotranspiracao: number;
}

export interface DadosSolo {
  tempSolo0cm: number;
  tempSolo6cm: number;
  tempSolo18cm: number;
  umidadeSolo01: number; // % (convertido de m³/m³ × 100)
  umidadeSolo13: number;
  umidadeSolo39: number;
}

export interface ClimaArea {
  atual: ClimaAtual;
  previsao7dias: PrevisaoDiaria[];
  solo: DadosSolo;
}

export async function buscarClimaArea(lat: number, lng: number): Promise<ClimaArea> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "weather_code",
      "wind_speed_10m",
      "precipitation",
    ].join(","),
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "precipitation_probability_max",
      "uv_index_max",
      "wind_speed_10m_max",
      "weather_code",
      "et0_fao_evapotranspiration",
    ].join(","),
    hourly: [
      "soil_temperature_0cm",
      "soil_temperature_6cm",
      "soil_temperature_18cm",
      "soil_moisture_0_to_1cm",
      "soil_moisture_1_to_3cm",
      "soil_moisture_3_to_9cm",
    ].join(","),
    timezone: "America/Sao_Paulo",
    forecast_days: "7",
  });

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    { next: { revalidate: 3600 } } // cache por 1 hora
  );

  if (!res.ok) throw new Error("Erro ao buscar dados climáticos da Open-Meteo");

  const d = await res.json();

  const atual: ClimaAtual = {
    temperatura: Math.round(d.current.temperature_2m),
    sensacaoTermica: Math.round(d.current.apparent_temperature),
    umidade: d.current.relative_humidity_2m,
    weatherCode: d.current.weather_code,
    vento: Math.round(d.current.wind_speed_10m),
    precipitacao: d.current.precipitation ?? 0,
  };

  const previsao7dias: PrevisaoDiaria[] = d.daily.time.map(
    (data: string, i: number) => ({
      data,
      tempMax: Math.round(d.daily.temperature_2m_max[i] ?? 0),
      tempMin: Math.round(d.daily.temperature_2m_min[i] ?? 0),
      precipitacao: parseFloat((d.daily.precipitation_sum[i] ?? 0).toFixed(1)),
      probChuva: d.daily.precipitation_probability_max[i] ?? 0,
      uvMax: parseFloat((d.daily.uv_index_max[i] ?? 0).toFixed(1)),
      ventoMax: Math.round(d.daily.wind_speed_10m_max[i] ?? 0),
      weatherCode: d.daily.weather_code[i] ?? 0,
      evapotranspiracao: parseFloat(
        (d.daily.et0_fao_evapotranspiration[i] ?? 0).toFixed(1)
      ),
    })
  );

  // Média das primeiras 6 horas do dia para dados de solo
  const avg = (arr: (number | null)[], n = 6) => {
    const vals = arr.slice(0, n).filter((v) => v != null) as number[];
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const solo: DadosSolo = {
    tempSolo0cm: parseFloat(avg(d.hourly.soil_temperature_0cm).toFixed(1)),
    tempSolo6cm: parseFloat(avg(d.hourly.soil_temperature_6cm).toFixed(1)),
    tempSolo18cm: parseFloat(avg(d.hourly.soil_temperature_18cm).toFixed(1)),
    umidadeSolo01: parseFloat((avg(d.hourly.soil_moisture_0_to_1cm) * 100).toFixed(1)),
    umidadeSolo13: parseFloat((avg(d.hourly.soil_moisture_1_to_3cm) * 100).toFixed(1)),
    umidadeSolo39: parseFloat((avg(d.hourly.soil_moisture_3_to_9cm) * 100).toFixed(1)),
  };

  return { atual, previsao7dias, solo };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function descricaoTempo(code: number): string {
  if (code === 0) return "Céu limpo";
  if (code <= 2) return "Parcialmente nublado";
  if (code === 3) return "Nublado";
  if (code <= 48) return "Nevoeiro";
  if (code <= 55) return "Garoa";
  if (code <= 65) return "Chuva";
  if (code <= 75) return "Neve";
  if (code <= 82) return "Pancadas de chuva";
  if (code <= 86) return "Pancadas de neve";
  if (code <= 99) return "Trovoada";
  return "Tempo instável";
}

export function categoriaUV(uv: number): { label: string; cor: string } {
  if (uv <= 2) return { label: "Baixo", cor: "text-emerald-400" };
  if (uv <= 5) return { label: "Moderado", cor: "text-yellow-400" };
  if (uv <= 7) return { label: "Alto", cor: "text-orange-400" };
  if (uv <= 10) return { label: "Muito alto", cor: "text-red-400" };
  return { label: "Extremo", cor: "text-purple-400" };
}

export function categoriaEvapotranspiracao(mm: number): { label: string; descricao: string; cor: string } {
  if (mm < 2) return { label: "Baixa", descricao: "Pouca demanda hídrica", cor: "text-emerald-400" };
  if (mm < 4) return { label: "Moderada", descricao: "Monitorar irrigação", cor: "text-yellow-400" };
  if (mm < 6) return { label: "Alta", descricao: "Considerar irrigação", cor: "text-orange-400" };
  return { label: "Muito alta", descricao: "Irrigação necessária", cor: "text-red-400" };
}

export function categoriaUmidadeSolo(pct: number): { label: string; cor: string } {
  if (pct < 15) return { label: "Solo seco", cor: "text-red-400" };
  if (pct < 30) return { label: "Adequado", cor: "text-emerald-400" };
  if (pct < 45) return { label: "Úmido", cor: "text-blue-400" };
  return { label: "Saturado", cor: "text-purple-400" };
}

export function diaSemana(dateStr: string, curto = true): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("pt-BR", {
    weekday: curto ? "short" : "long",
  }).replace(".", "");
}
