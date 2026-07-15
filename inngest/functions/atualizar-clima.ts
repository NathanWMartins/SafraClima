import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import { TipoAlerta } from "@prisma/client";
import {
  THRESHOLDS_PADRAO,
  geadaSeveridade,
  chuvaSeveridade,
  ventoSeveridade,
  uvSeveridade,
  aqiSeveridade,
  secaSeveridade,
} from "@/lib/alertas-defaults";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Forecast API (tempo + horário) ──────────────────────────────────────────
async function fetchForecast(lat: number, lng: number) {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    daily: [
      "temperature_2m_max", "temperature_2m_min",
      "precipitation_sum", "precipitation_probability_max",
      "uv_index_max", "wind_speed_10m_max", "weather_code",
      "et0_fao_evapotranspiration", "sunrise", "sunset", "sunshine_duration",
    ].join(","),
    hourly: [
      "temperature_2m", "apparent_temperature", "relative_humidity_2m",
      "precipitation_probability", "precipitation", "weather_code",
      "wind_speed_10m", "soil_temperature_0cm", "soil_temperature_6cm",
      "soil_temperature_18cm", "soil_moisture_0_to_1cm",
      "soil_moisture_1_to_3cm", "soil_moisture_3_to_9cm",
    ].join(","),
    timezone: "America/Sao_Paulo",
    forecast_days: "7",
  });

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    { signal: AbortSignal.timeout(20000) }
  );
  if (!res.ok) throw new Error(`Forecast API retornou ${res.status}`);
  return res.json();
}

// ─── Air Quality API ──────────────────────────────────────────────────────────
async function fetchAirQuality(lat: number, lng: number) {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    hourly: ["pm10", "pm2_5", "us_aqi", "uv_index", "dust", "carbon_monoxide"].join(","),
    timezone: "America/Sao_Paulo",
    forecast_days: "7",
  });

  const res = await fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`,
    { signal: AbortSignal.timeout(20000) }
  );
  if (!res.ok) throw new Error(`Air Quality API retornou ${res.status}`);
  return res.json();
}

function avgSlice(arr: (number | null)[], start: number, end: number): number {
  const vals = arr.slice(start, end).filter((v) => v != null) as number[];
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

function maxSlice(arr: (number | null)[], start: number, end: number): number {
  const vals = arr.slice(start, end).filter((v) => v != null) as number[];
  return vals.length ? Math.max(...vals) : 0;
}

function timeFromISO(iso: string): string {
  // "2024-01-15T06:23" → "06:23"
  return iso.slice(11, 16);
}

// ─── Análise de alertas para uma área ────────────────────────────────────────
async function analisarAlertas(areaId: string, userId: string) {
  // Busca preferências do usuário (só os tipos que ele customizou)
  const prefs = await prisma.preferenciaAlerta.findMany({
    where: { userId },
  });
  const prefMap = new Map(prefs.map((p) => [p.tipo, p]));

  // Retorna null se o alerta estiver desabilitado, ou o threshold vigente
  function getThreshold(tipo: TipoAlerta): number | null {
    const pref = prefMap.get(tipo);
    if (pref && !pref.ativo) return null; // usuário desabilitou
    return pref?.limiar ?? THRESHOLDS_PADRAO[tipo];
  }

  // Busca dados dos próximos 7 dias já salvos no banco
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dias = await prisma.dadoClimaticoDiario.findMany({
    where: { areaId, data: { gte: hoje } },
    orderBy: { data: "asc" },
    take: 7,
  });

  const aqDias = await prisma.qualidadeArDiario.findMany({
    where: { areaId, data: { gte: hoje } },
    orderBy: { data: "asc" },
    take: 7,
  });
  const aqMap = new Map(aqDias.map((q) => [q.data.toISOString().slice(0, 10), q]));

  type AlertaPayload = {
    tipo: TipoAlerta;
    severidade: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
    titulo: string;
    mensagem: string;
    dataEvento: Date;
  };

  const alertas: AlertaPayload[] = [];

  // ── Análise por dia ──────────────────────────────────────────────────────
  for (const dia of dias) {
    const dataStr = dia.data.toISOString().slice(0, 10);
    const dataLabel = new Date(dia.data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      timeZone: "UTC",
    });

    // GEADA
    const limiarGeada = getThreshold(TipoAlerta.GEADA);
    if (limiarGeada !== null && dia.tempMin !== null && dia.tempMin < limiarGeada) {
      alertas.push({
        tipo: TipoAlerta.GEADA,
        severidade: geadaSeveridade(dia.tempMin),
        titulo: `Risco de geada — mín. ${Math.round(dia.tempMin)}°C`,
        mensagem: `Em ${dataLabel}, a temperatura mínima prevista é de ${dia.tempMin.toFixed(1)}°C, abaixo do limite de ${limiarGeada}°C. Proteja culturas sensíveis à geada.`,
        dataEvento: dia.data,
      });
    }

    // CHUVA INTENSA
    const limiarChuva = getThreshold(TipoAlerta.CHUVA_INTENSA);
    if (limiarChuva !== null && dia.precipitacao !== null && dia.precipitacao >= limiarChuva) {
      alertas.push({
        tipo: TipoAlerta.CHUVA_INTENSA,
        severidade: chuvaSeveridade(dia.precipitacao),
        titulo: `Chuva intensa — ${Math.round(dia.precipitacao)} mm`,
        mensagem: `Em ${dataLabel}, previsão de ${dia.precipitacao.toFixed(1)} mm de precipitação acumulada${dia.probPrecipitacao ? ` (${dia.probPrecipitacao}% de probabilidade)` : ""}. Atenção ao escoamento e erosão do solo.`,
        dataEvento: dia.data,
      });
    }

    // VENTO FORTE
    const limiarVento = getThreshold(TipoAlerta.VENTO_FORTE);
    if (limiarVento !== null && dia.ventoMax !== null && dia.ventoMax >= limiarVento) {
      alertas.push({
        tipo: TipoAlerta.VENTO_FORTE,
        severidade: ventoSeveridade(dia.ventoMax),
        titulo: `Vento forte — ${Math.round(dia.ventoMax)} km/h`,
        mensagem: `Em ${dataLabel}, rajadas de vento de até ${dia.ventoMax.toFixed(0)} km/h. Reforce estruturas e evite pulverização.`,
        dataEvento: dia.data,
      });
    }

    // UV ALTO
    const limiarUV = getThreshold(TipoAlerta.UV_ALTO);
    if (limiarUV !== null && dia.uvMax !== null && dia.uvMax >= limiarUV) {
      alertas.push({
        tipo: TipoAlerta.UV_ALTO,
        severidade: uvSeveridade(dia.uvMax),
        titulo: `UV alto — índice ${dia.uvMax.toFixed(1)}`,
        mensagem: `Em ${dataLabel}, índice UV máximo de ${dia.uvMax.toFixed(1)}. Use proteção solar e evite exposição ao sol entre 10h–16h.`,
        dataEvento: dia.data,
      });
    }

    // QUALIDADE DO AR
    const limiarAQI = getThreshold(TipoAlerta.QUALIDADE_AR_RUIM);
    const aq = aqMap.get(dataStr);
    if (limiarAQI !== null && aq?.usAqi !== null && aq?.usAqi !== undefined && aq.usAqi >= limiarAQI) {
      alertas.push({
        tipo: TipoAlerta.QUALIDADE_AR_RUIM,
        severidade: aqiSeveridade(aq.usAqi),
        titulo: `Qualidade do ar ruim — AQI ${aq.usAqi}`,
        mensagem: `Em ${dataLabel}, o índice de qualidade do ar (US AQI) é ${aq.usAqi}${aq.pm25 ? `, PM2.5: ${aq.pm25.toFixed(0)} μg/m³` : ""}. Evite atividades físicas intensas ao ar livre.`,
        dataEvento: dia.data,
      });
    }
  }

  // ── SECA — dias consecutivos sem chuva ──────────────────────────────────
  const limiarSeca = getThreshold(TipoAlerta.SECA);
  if (limiarSeca !== null && dias.length > 0) {
    let consecutivos = 0;
    let inicioSeca: Date | null = null;

    for (const dia of dias) {
      if ((dia.precipitacao ?? 0) < 1) {
        consecutivos++;
        if (!inicioSeca) inicioSeca = dia.data;
      } else {
        consecutivos = 0;
        inicioSeca = null;
      }

      if (consecutivos >= limiarSeca && inicioSeca) {
        alertas.push({
          tipo: TipoAlerta.SECA,
          severidade: secaSeveridade(consecutivos),
          titulo: `${consecutivos} dias sem chuva`,
          mensagem: `Previsão de ${consecutivos} dias consecutivos sem precipitação significativa. Monitore a umidade do solo e avalie necessidade de irrigação.`,
          dataEvento: inicioSeca,
        });
        break; // um único alerta de seca por ciclo
      }
    }
  }

  // ── Upsert no banco ──────────────────────────────────────────────────────
  for (const alerta of alertas) {
    await prisma.alerta.upsert({
      where: {
        areaId_tipo_dataEvento: {
          areaId,
          tipo: alerta.tipo,
          dataEvento: alerta.dataEvento,
        },
      },
      create: {
        ...alerta,
        areaId,
        userId,
        lido: false,
        enviado: false,
      },
      update: {
        titulo: alerta.titulo,
        mensagem: alerta.mensagem,
        severidade: alerta.severidade,
        // Não reseta lido — o usuário já marcou como lido
      },
    });
  }

  return alertas.length;
}

export const atualizarClimaAreas = inngest.createFunction(
  {
    id: "atualizar-clima-areas",
    name: "Atualizar Clima de Todas as Áreas",
    retries: 3,
  },
  { cron: "0 * * * *" },

  async ({ step, logger }) => {
    const areas = await step.run("buscar-areas", async () => {
      return prisma.area.findMany({
        where: { ativa: true },
        select: { id: true, latitude: true, longitude: true, userId: true },
      });
    });

    logger.info(`Atualizando ${areas.length} área(s)`);

    let sucesso = 0;
    let falhas = 0;

    for (const area of areas) {
      await step.run(`area-${area.id}`, async () => {
        // Busca forecast e qualidade do ar em paralelo
        const [forecast, airQuality] = await Promise.all([
          fetchForecast(area.latitude, area.longitude),
          fetchAirQuality(area.latitude, area.longitude).catch(() => null),
        ]);

        const d = forecast;

        // ── Dados diários ───────────────────────────────────────────────────
        const dailyUpserts = d.daily.time.map(async (data: string, i: number) => {
          const h0 = i * 24;
          const h1 = h0 + 24;

          await prisma.dadoClimaticoDiario.upsert({
            where: { areaId_data: { areaId: area.id, data: new Date(data) } },
            create: {
              areaId: area.id,
              data: new Date(data),
              tempMax: d.daily.temperature_2m_max[i],
              tempMin: d.daily.temperature_2m_min[i],
              precipitacao: d.daily.precipitation_sum[i],
              probPrecipitacao: d.daily.precipitation_probability_max[i],
              uvMax: d.daily.uv_index_max[i],
              ventoMax: d.daily.wind_speed_10m_max[i],
              weatherCode: d.daily.weather_code[i],
              evapotranspiracao: d.daily.et0_fao_evapotranspiration[i],
              umidadeRelativa: Math.round(avgSlice(d.hourly.relative_humidity_2m, h0, h1)),
              tempSolo0cm: parseFloat(avgSlice(d.hourly.soil_temperature_0cm, h0, h1).toFixed(1)),
              tempSolo6cm: parseFloat(avgSlice(d.hourly.soil_temperature_6cm, h0, h1).toFixed(1)),
              tempSolo18cm: parseFloat(avgSlice(d.hourly.soil_temperature_18cm, h0, h1).toFixed(1)),
              umidadeSolo01: parseFloat((avgSlice(d.hourly.soil_moisture_0_to_1cm, h0, h1) * 100).toFixed(1)),
              umidadeSolo13: parseFloat((avgSlice(d.hourly.soil_moisture_1_to_3cm, h0, h1) * 100).toFixed(1)),
              umidadeSolo39: parseFloat((avgSlice(d.hourly.soil_moisture_3_to_9cm, h0, h1) * 100).toFixed(1)),
              nascerSol: d.daily.sunrise[i] ? timeFromISO(d.daily.sunrise[i]) : null,
              porSol: d.daily.sunset[i] ? timeFromISO(d.daily.sunset[i]) : null,
              duracaoSol: d.daily.sunshine_duration[i] ? Math.round(d.daily.sunshine_duration[i] / 60) : null,
              ehHistorico: false,
            },
            update: {
              tempMax: d.daily.temperature_2m_max[i],
              tempMin: d.daily.temperature_2m_min[i],
              precipitacao: d.daily.precipitation_sum[i],
              probPrecipitacao: d.daily.precipitation_probability_max[i],
              uvMax: d.daily.uv_index_max[i],
              ventoMax: d.daily.wind_speed_10m_max[i],
              weatherCode: d.daily.weather_code[i],
              evapotranspiracao: d.daily.et0_fao_evapotranspiration[i],
              umidadeRelativa: Math.round(avgSlice(d.hourly.relative_humidity_2m, h0, h1)),
              tempSolo0cm: parseFloat(avgSlice(d.hourly.soil_temperature_0cm, h0, h1).toFixed(1)),
              tempSolo6cm: parseFloat(avgSlice(d.hourly.soil_temperature_6cm, h0, h1).toFixed(1)),
              tempSolo18cm: parseFloat(avgSlice(d.hourly.soil_temperature_18cm, h0, h1).toFixed(1)),
              umidadeSolo01: parseFloat((avgSlice(d.hourly.soil_moisture_0_to_1cm, h0, h1) * 100).toFixed(1)),
              umidadeSolo13: parseFloat((avgSlice(d.hourly.soil_moisture_1_to_3cm, h0, h1) * 100).toFixed(1)),
              umidadeSolo39: parseFloat((avgSlice(d.hourly.soil_moisture_3_to_9cm, h0, h1) * 100).toFixed(1)),
              nascerSol: d.daily.sunrise[i] ? timeFromISO(d.daily.sunrise[i]) : null,
              porSol: d.daily.sunset[i] ? timeFromISO(d.daily.sunset[i]) : null,
              duracaoSol: d.daily.sunshine_duration[i] ? Math.round(d.daily.sunshine_duration[i] / 60) : null,
            },
          });
        });

        // ── Dados horários (próximas 168h) ──────────────────────────────────
        const hourlyUpserts = d.hourly.time.map(async (horaStr: string, i: number) => {
          await prisma.dadoClimaticoHorario.upsert({
            where: { areaId_hora: { areaId: area.id, hora: new Date(horaStr) } },
            create: {
              areaId: area.id,
              hora: new Date(horaStr),
              temperatura: d.hourly.temperature_2m[i],
              sensacaoTermica: d.hourly.apparent_temperature[i],
              umidade: d.hourly.relative_humidity_2m[i],
              probChuva: d.hourly.precipitation_probability[i],
              precipitacao: d.hourly.precipitation[i],
              weatherCode: d.hourly.weather_code[i],
              vento: d.hourly.wind_speed_10m[i],
            },
            update: {
              temperatura: d.hourly.temperature_2m[i],
              sensacaoTermica: d.hourly.apparent_temperature[i],
              umidade: d.hourly.relative_humidity_2m[i],
              probChuva: d.hourly.precipitation_probability[i],
              precipitacao: d.hourly.precipitation[i],
              weatherCode: d.hourly.weather_code[i],
              vento: d.hourly.wind_speed_10m[i],
            },
          });
        });

        // ── Qualidade do ar (diária agregada) ───────────────────────────────
        const aqUpserts = airQuality
          ? d.daily.time.map(async (data: string, i: number) => {
              const h0 = i * 24;
              const h1 = h0 + 24;
              const aq = airQuality.hourly;

              await prisma.qualidadeArDiario.upsert({
                where: { areaId_data: { areaId: area.id, data: new Date(data) } },
                create: {
                  areaId: area.id,
                  data: new Date(data),
                  pm10: parseFloat(avgSlice(aq.pm10, h0, h1).toFixed(1)),
                  pm25: parseFloat(avgSlice(aq.pm2_5, h0, h1).toFixed(1)),
                  dust: parseFloat(maxSlice(aq.dust, h0, h1).toFixed(1)),
                  co: parseFloat(avgSlice(aq.carbon_monoxide, h0, h1).toFixed(1)),
                  uvIndexMax: parseFloat(maxSlice(aq.uv_index, h0, h1).toFixed(1)),
                  usAqi: Math.round(maxSlice(aq.us_aqi, h0, h1)),
                },
                update: {
                  pm10: parseFloat(avgSlice(aq.pm10, h0, h1).toFixed(1)),
                  pm25: parseFloat(avgSlice(aq.pm2_5, h0, h1).toFixed(1)),
                  dust: parseFloat(maxSlice(aq.dust, h0, h1).toFixed(1)),
                  co: parseFloat(avgSlice(aq.carbon_monoxide, h0, h1).toFixed(1)),
                  uvIndexMax: parseFloat(maxSlice(aq.uv_index, h0, h1).toFixed(1)),
                  usAqi: Math.round(maxSlice(aq.us_aqi, h0, h1)),
                },
              });
            })
          : [];

        await Promise.all([...dailyUpserts, ...hourlyUpserts, ...aqUpserts]);

        // Limpa horários antigos (> 2 dias atrás)
        const limite = new Date();
        limite.setDate(limite.getDate() - 2);
        await prisma.dadoClimaticoHorario.deleteMany({
          where: { areaId: area.id, hora: { lt: limite } },
        });

        sucesso++;
        logger.info(`Área ${area.id} atualizada`);
        await delay(600);
      });

      // ── Analisa e gera alertas para a área ──────────────────────────────
      await step.run(`alertas-area-${area.id}`, async () => {
        const totalAlertas = await analisarAlertas(area.id, area.userId);
        logger.info(`Área ${area.id}: ${totalAlertas} alerta(s) gerado(s)/atualizado(s)`);
      });
    }

    return { totalAreas: areas.length, sucesso, falhas, executadoEm: new Date().toISOString() };
  }
);
