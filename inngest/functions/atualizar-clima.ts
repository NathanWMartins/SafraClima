import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchClimaArea(lat: number, lng: number) {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
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
      "relative_humidity_2m",
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
    { signal: AbortSignal.timeout(20000) }
  );

  if (!res.ok) throw new Error(`Open-Meteo retornou ${res.status}`);
  return res.json();
}

function avg(arr: (number | null)[], inicio: number, fim: number): number {
  const vals = arr.slice(inicio, fim).filter((v) => v != null) as number[];
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

export const atualizarClimaAreas = inngest.createFunction(
  {
    id: "atualizar-clima-areas",
    name: "Atualizar Clima de Todas as Áreas",
    // Retry automático em caso de falha (3 tentativas com backoff)
    retries: 3,
  },
  // Roda toda hora em ponto
  { cron: "0 * * * *" },

  async ({ step, logger }) => {
    // Step 1: busca todas as áreas ativas
    const areas = await step.run("buscar-areas", async () => {
      return prisma.area.findMany({
        where: { ativa: true },
        select: { id: true, latitude: true, longitude: true },
      });
    });

    logger.info(`Iniciando atualização de ${areas.length} área(s)`);

    let sucesso = 0;
    let falhas = 0;

    // Step por área — cada uma aparece separada no dashboard do Inngest
    for (const area of areas) {
      await step.run(`area-${area.id}`, async () => {
        const d = await fetchClimaArea(area.latitude, area.longitude);

        const upserts = d.daily.time.map(async (data: string, i: number) => {
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
              umidadeRelativa: Math.round(avg(d.hourly.relative_humidity_2m, h0, h1)),
              tempSolo0cm: parseFloat(avg(d.hourly.soil_temperature_0cm, h0, h1).toFixed(1)),
              tempSolo6cm: parseFloat(avg(d.hourly.soil_temperature_6cm, h0, h1).toFixed(1)),
              tempSolo18cm: parseFloat(avg(d.hourly.soil_temperature_18cm, h0, h1).toFixed(1)),
              umidadeSolo01: parseFloat((avg(d.hourly.soil_moisture_0_to_1cm, h0, h1) * 100).toFixed(1)),
              umidadeSolo13: parseFloat((avg(d.hourly.soil_moisture_1_to_3cm, h0, h1) * 100).toFixed(1)),
              umidadeSolo39: parseFloat((avg(d.hourly.soil_moisture_3_to_9cm, h0, h1) * 100).toFixed(1)),
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
              umidadeRelativa: Math.round(avg(d.hourly.relative_humidity_2m, h0, h1)),
              tempSolo0cm: parseFloat(avg(d.hourly.soil_temperature_0cm, h0, h1).toFixed(1)),
              tempSolo6cm: parseFloat(avg(d.hourly.soil_temperature_6cm, h0, h1).toFixed(1)),
              tempSolo18cm: parseFloat(avg(d.hourly.soil_temperature_18cm, h0, h1).toFixed(1)),
              umidadeSolo01: parseFloat((avg(d.hourly.soil_moisture_0_to_1cm, h0, h1) * 100).toFixed(1)),
              umidadeSolo13: parseFloat((avg(d.hourly.soil_moisture_1_to_3cm, h0, h1) * 100).toFixed(1)),
              umidadeSolo39: parseFloat((avg(d.hourly.soil_moisture_3_to_9cm, h0, h1) * 100).toFixed(1)),
            },
          });
        });

        await Promise.all(upserts);
        sucesso++;
        logger.info(`Área ${area.id} atualizada com sucesso`);

        // Delay para não sobrecarregar a Open-Meteo
        await delay(500);
      });
    }

    return {
      totalAreas: areas.length,
      sucesso,
      falhas,
      executadoEm: new Date().toISOString(),
    };
  }
);
