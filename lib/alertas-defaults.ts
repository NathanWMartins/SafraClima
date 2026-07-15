import { SeveridadeAlerta, TipoAlerta } from "@prisma/client";

// ─── Thresholds padrão do sistema ────────────────────────────────────────────

export const THRESHOLDS_PADRAO: Record<TipoAlerta, number> = {
  GEADA: 4,               // °C mínima
  CHUVA_INTENSA: 30,      // mm acumulado no dia
  VENTO_FORTE: 60,        // km/h
  SECA: 5,                // dias consecutivos sem chuva (< 1mm)
  UV_ALTO: 8,             // índice UV máximo
  QUALIDADE_AR_RUIM: 150, // US AQI
  ENCHENTE: 1,            // placeholder (não usado ainda)
};

export const LABEL_ALERTA: Record<TipoAlerta, string> = {
  GEADA: "Geada",
  CHUVA_INTENSA: "Chuva intensa",
  VENTO_FORTE: "Vento forte",
  SECA: "Seca",
  UV_ALTO: "UV alto",
  QUALIDADE_AR_RUIM: "Qualidade do ar ruim",
  ENCHENTE: "Enchente",
};

export const UNIDADE_ALERTA: Record<TipoAlerta, string> = {
  GEADA: "°C",
  CHUVA_INTENSA: "mm",
  VENTO_FORTE: "km/h",
  SECA: "dias",
  UV_ALTO: "",
  QUALIDADE_AR_RUIM: "AQI",
  ENCHENTE: "",
};

export const DESCRICAO_ALERTA: Record<TipoAlerta, string> = {
  GEADA: "Temperatura mínima abaixo do limite",
  CHUVA_INTENSA: "Precipitação acumulada no dia acima do limite",
  VENTO_FORTE: "Velocidade máxima do vento acima do limite",
  SECA: "Número de dias consecutivos sem precipitação",
  UV_ALTO: "Índice UV máximo acima do limite",
  QUALIDADE_AR_RUIM: "Índice de qualidade do ar (AQI) acima do limite",
  ENCHENTE: "Risco de enchente no rio mais próximo",
};

// ─── Helpers de geração de alerta ────────────────────────────────────────────

export function geadaSeveridade(tempMin: number): SeveridadeAlerta {
  if (tempMin < -2) return "CRITICA";
  if (tempMin < 0) return "ALTA";
  if (tempMin < 2) return "MEDIA";
  return "BAIXA";
}

export function chuvaSeveridade(mm: number): SeveridadeAlerta {
  if (mm >= 80) return "CRITICA";
  if (mm >= 50) return "ALTA";
  if (mm >= 30) return "MEDIA";
  return "BAIXA";
}

export function ventoSeveridade(kmh: number): SeveridadeAlerta {
  if (kmh >= 100) return "CRITICA";
  if (kmh >= 80) return "ALTA";
  if (kmh >= 60) return "MEDIA";
  return "BAIXA";
}

export function uvSeveridade(uv: number): SeveridadeAlerta {
  if (uv >= 12) return "CRITICA";
  if (uv >= 10) return "ALTA";
  if (uv >= 8) return "MEDIA";
  return "BAIXA";
}

export function aqiSeveridade(aqi: number): SeveridadeAlerta {
  if (aqi >= 300) return "CRITICA";
  if (aqi >= 200) return "ALTA";
  if (aqi >= 150) return "MEDIA";
  return "BAIXA";
}

export function secaSeveridade(dias: number): SeveridadeAlerta {
  if (dias >= 14) return "CRITICA";
  if (dias >= 10) return "ALTA";
  if (dias >= 7) return "MEDIA";
  return "BAIXA";
}

// ─── Tipos para listagem de alertas ──────────────────────────────────────────

export const SEVERIDADE_ORDEM: SeveridadeAlerta[] = ["CRITICA", "ALTA", "MEDIA", "BAIXA"];

export const SEVERIDADE_LABEL: Record<SeveridadeAlerta, string> = {
  CRITICA: "Crítico",
  ALTA: "Alto",
  MEDIA: "Médio",
  BAIXA: "Baixo",
};

export const SEVERIDADE_COR: Record<SeveridadeAlerta, string> = {
  CRITICA: "#EF4444",
  ALTA: "#F97316",
  MEDIA: "#EAB308",
  BAIXA: "#6B7280",
};

export const TIPO_ICONE: Record<TipoAlerta, string> = {
  GEADA: "🧊",
  CHUVA_INTENSA: "🌧️",
  VENTO_FORTE: "💨",
  SECA: "☀️",
  UV_ALTO: "☀️",
  QUALIDADE_AR_RUIM: "🌫️",
  ENCHENTE: "🌊",
};
