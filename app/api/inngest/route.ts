import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { atualizarClimaAreas } from "@/inngest/functions/atualizar-clima";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [atualizarClimaAreas],
});
